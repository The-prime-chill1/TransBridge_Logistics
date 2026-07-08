import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  ArrowLeft, Package, User, MapPin, Weight, Calendar,
  FileText, Image as ImageIcon, Upload, X, Save, Search
} from 'lucide-react'
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc,
  query, where, serverTimestamp
} from 'firebase/firestore'
import { db } from '../../config/firebase'
import ShipmentTimeline from '../../components/ui/ShipmentTimeline'
import styles from '../Dashboard.module.css'
import formStyles from './ShipmentForm.module.css'

const STATUSES = [
  'Shipment Created', 'Picked Up', 'Warehouse', 'Departed UK', 'In Transit',
  'Customs Clearance', 'Arrived Nigeria', 'Out for Delivery', 'Delivered', 'Cancelled', 'On Hold',
]
const PACKAGE_TYPES = ['Document', 'Parcel', 'Pallet', 'Container', 'Personal Effects', 'Commercial Goods']
const COURIERS = ['Air Freight', 'Sea Freight']

// Generate TB-YYYY-XXXXXX style tracking numbers
function generateTrackingNumber() {
  const year = new Date().getFullYear()
  const rand = Math.floor(100000 + Math.random() * 900000)
  return `TB-${year}-${rand}`
}

export default function ShipmentForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [shipment, setShipment] = useState(null)
  const [customerSearch, setCustomerSearch] = useState('')
  const [customerResults, setCustomerResults] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [images, setImages] = useState([])
  const [remarks, setRemarks] = useState('')

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      receiverName: '', receiverPhone: '', receiverEmail: '', receiverAddress: '',
      origin: 'London, UK', destination: 'Lagos, NG', currentLocation: '',
      weight: '', packageType: 'Parcel', courier: 'Air Freight',
      estimatedDelivery: '', notes: '', price: '', currency: 'GBP',
      status: 'Shipment Created',
    },
  })

  const watchedStatus = watch('status')

  useEffect(() => {
    document.title = isEdit ? 'Edit Shipment — Admin' : 'New Shipment — Admin'
    if (isEdit) loadShipment()
  }, [id])

  const loadShipment = async () => {
    try {
      const docRef = doc(db, 'shipments', id)
      const docSnap = await getDoc(docRef)
      if (!docSnap.exists()) {
        toast.error('Shipment not found')
        navigate('/admin/shipments')
        return
      }
      const s = { id: docSnap.id, ...docSnap.data() }
      setShipment(s)

      // Try to load customer info from users collection
      if (s.customerId) {
        const userSnap = await getDoc(doc(db, 'users', s.customerId))
        if (userSnap.exists()) {
          setSelectedCustomer({ id: userSnap.id, ...userSnap.data() })
        }
      }

      setValue('receiverName', s.receiverName || s.receiver?.name || '')
      setValue('receiverPhone', s.receiverPhone || s.receiver?.phone || '')
      setValue('receiverEmail', s.receiverEmail || s.receiver?.email || '')
      setValue('receiverAddress', s.receiverAddress || s.receiver?.address || '')
      setValue('origin', s.origin || '')
      setValue('destination', s.destination || '')
      setValue('currentLocation', s.currentLocation || '')
      setValue('weight', s.weight || '')
      setValue('packageType', s.packageType || 'Parcel')
      setValue('courier', s.courier || 'Air Freight')
      setValue('estimatedDelivery', s.estimatedDelivery
        ? (s.estimatedDelivery?.toDate
            ? s.estimatedDelivery.toDate().toISOString().split('T')[0]
            : String(s.estimatedDelivery).split('T')[0])
        : '')
      setValue('notes', s.notes || '')
      setValue('price', s.price || '')
      setValue('currency', s.currency || 'GBP')
      setValue('status', s.status || 'Shipment Created')
    } catch (err) {
      console.error(err)
      toast.error('Failed to load shipment')
      navigate('/admin/shipments')
    } finally {
      setLoading(false)
    }
  }

  const searchCustomers = async (searchText) => {
    setCustomerSearch(searchText)
    if (searchText.length < 2) { setCustomerResults([]); return }
    try {
      const snap = await getDocs(query(collection(db, 'users'), where('role', '==', 'customer')))
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      const q = searchText.toLowerCase()
      const results = all.filter(c =>
        (c.firstName + ' ' + c.lastName).toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.includes(q)
      ).slice(0, 6)
      setCustomerResults(results)
    } catch (err) {
      console.error(err)
    }
  }

  const onSubmit = async (data) => {
    if (!isEdit && !selectedCustomer) {
      toast.error('Please select a customer')
      return
    }

    setSaving(true)
    try {
      const payload = {
        customerId: selectedCustomer?.id || selectedCustomer?.uid || null,
        receiverName: data.receiverName,
        receiverPhone: data.receiverPhone,
        receiverEmail: data.receiverEmail,
        receiverAddress: data.receiverAddress,
        origin: data.origin,
        destination: data.destination,
        currentLocation: data.currentLocation || data.origin,
        weight: parseFloat(data.weight),
        packageType: data.packageType,
        courier: data.courier,
        estimatedDelivery: data.estimatedDelivery || null,
        notes: data.notes,
        price: data.price ? parseFloat(data.price) : 0,
        currency: data.currency,
        updatedAt: serverTimestamp(),
      }

      if (isEdit) {
        const prevStatus = shipment?.status
        const newStatus = data.status
        const historyEntry = remarks || newStatus !== prevStatus
          ? {
              status: newStatus,
              location: data.currentLocation || data.origin,
              remarks: remarks || `Status updated to ${newStatus}`,
              timestamp: new Date().toISOString(),
            }
          : null

        const updatePayload = {
          ...payload,
          status: newStatus,
          ...(historyEntry && {
            trackingHistory: [...(shipment.trackingHistory || []), historyEntry]
          })
        }

        await updateDoc(doc(db, 'shipments', id), updatePayload)
        toast.success('Shipment updated successfully')
      } else {
        const trackingNumber = generateTrackingNumber()
        await addDoc(collection(db, 'shipments'), {
          ...payload,
          trackingNumber,
          status: 'Shipment Created',
          trackingHistory: [{
            status: 'Shipment Created',
            location: data.origin,
            remarks: 'Shipment has been created and registered.',
            timestamp: new Date().toISOString(),
          }],
          createdAt: serverTimestamp(),
        })
        toast.success(`Shipment created: ${trackingNumber}`)
      }

      navigate('/admin/shipments')
    } catch (err) {
      console.error(err)
      toast.error('Failed to save shipment')
    } finally {
      setSaving(false)
    }
  }

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files)
    const newImages = files.map(file => ({ file, preview: URL.createObjectURL(file) }))
    setImages(prev => [...prev, ...newImages])
  }

  const removeImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx))
  }

  if (loading) {
    return <div className={styles.loadingWrap}><span className='loading-spinner' style={{ width: 32, height: 32 }} /></div>
  }

  return (
    <div>
      <div className={styles.pageHead}>
        <div>
          <Link to='/admin/shipments' className={formStyles.backLink}><ArrowLeft size={15} /> Back to Shipments</Link>
          <h1 className={styles.pageTitle} style={{ marginTop: 10 }}>
            {isEdit ? `Edit Shipment ${shipment?.trackingNumber}` : 'Create New Shipment'}
          </h1>
          <p className={styles.pageSub}>
            {isEdit ? 'Update shipment details, status, and tracking information.' : 'Fill in the details to generate a new tracking number.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={formStyles.layout}>
          <div className={formStyles.mainCol}>
            {/* Customer Selection */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}><User size={16} /> Customer</h3>
              {isEdit ? (
                <div className={formStyles.selectedCustomer}>
                  <div className={formStyles.customerAvatar}>
                    {selectedCustomer?.firstName?.[0]}{selectedCustomer?.lastName?.[0]}
                  </div>
                  <div>
                    <div className={formStyles.customerName}>{selectedCustomer?.firstName} {selectedCustomer?.lastName}</div>
                    <div className={formStyles.customerMeta}>{selectedCustomer?.email}</div>
                  </div>
                </div>
              ) : selectedCustomer ? (
                <div className={formStyles.selectedCustomer}>
                  <div className={formStyles.customerAvatar}>
                    {selectedCustomer.firstName?.[0]}{selectedCustomer.lastName?.[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className={formStyles.customerName}>{selectedCustomer.firstName} {selectedCustomer.lastName}</div>
                    <div className={formStyles.customerMeta}>{selectedCustomer.email} · {selectedCustomer.phone}</div>
                  </div>
                  <button type='button' className={styles.iconBtnSm} onClick={() => setSelectedCustomer(null)}><X size={14} /></button>
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <div className={styles.searchWrap}>
                    <Search size={16} className={styles.searchIcon} />
                    <input
                      className={styles.searchInput}
                      placeholder='Search customer by name, email, or phone...'
                      value={customerSearch}
                      onChange={e => searchCustomers(e.target.value)}
                    />
                  </div>
                  {customerResults.length > 0 && (
                    <div className={formStyles.customerDropdown}>
                      {customerResults.map(c => (
                        <div key={c.id} className={formStyles.customerOption} onClick={() => { setSelectedCustomer(c); setCustomerResults([]); setCustomerSearch('') }}>
                          <div className={formStyles.customerAvatar}>{c.firstName?.[0]}{c.lastName?.[0]}</div>
                          <div>
                            <div className={formStyles.customerName}>{c.firstName} {c.lastName}</div>
                            <div className={formStyles.customerMeta}>{c.email}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Receiver Details */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}><User size={16} /> Receiver Details</h3>
              <div className={formStyles.row2}>
                <div className='form-group'>
                  <label className='form-label'>Receiver Name</label>
                  <input className={`form-input ${errors.receiverName ? 'error' : ''}`} placeholder='Full name' {...register('receiverName', { required: 'Required' })} />
                </div>
                <div className='form-group'>
                  <label className='form-label'>Receiver Phone</label>
                  <input className={`form-input ${errors.receiverPhone ? 'error' : ''}`} placeholder='+234...' {...register('receiverPhone', { required: 'Required' })} />
                </div>
              </div>
              <div className={formStyles.row2}>
                <div className='form-group'>
                  <label className='form-label'>Receiver Email (optional)</label>
                  <input className='form-input' placeholder='receiver@example.com' {...register('receiverEmail')} />
                </div>
                <div className='form-group'>
                  <label className='form-label'>Delivery Address</label>
                  <input className='form-input' placeholder='Street, city' {...register('receiverAddress')} />
                </div>
              </div>
            </div>

            {/* Route & Package */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}><MapPin size={16} /> Route & Package</h3>
              <div className={formStyles.row2}>
                <div className='form-group'>
                  <label className='form-label'>Origin</label>
                  <input className={`form-input ${errors.origin ? 'error' : ''}`} placeholder='London, UK' {...register('origin', { required: 'Required' })} />
                </div>
                <div className='form-group'>
                  <label className='form-label'>Destination</label>
                  <input className={`form-input ${errors.destination ? 'error' : ''}`} placeholder='Lagos, NG' {...register('destination', { required: 'Required' })} />
                </div>
              </div>
              <div className='form-group' style={{ marginBottom: 14 }}>
                <label className='form-label'>Current Location</label>
                <input className='form-input' placeholder='Defaults to origin if left blank' {...register('currentLocation')} />
              </div>
              <div className={formStyles.row3}>
                <div className='form-group'>
                  <label className='form-label'>Weight (kg)</label>
                  <input type='number' step='0.1' className={`form-input ${errors.weight ? 'error' : ''}`} placeholder='12.5' {...register('weight', { required: 'Required' })} />
                </div>
                <div className='form-group'>
                  <label className='form-label'>Package Type</label>
                  <select className='form-input' {...register('packageType')}>
                    {PACKAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className='form-group'>
                  <label className='form-label'>Courier</label>
                  <select className='form-input' {...register('courier')}>
                    {COURIERS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}><FileText size={16} /> Notes</h3>
              <textarea className='form-input' rows={4} placeholder='Additional notes visible to the customer...' {...register('notes')} />
            </div>

            {/* Images */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}><ImageIcon size={16} /> Shipment Images</h3>
              <label className={formStyles.uploadZone}>
                <Upload size={22} />
                <span>Click to upload images</span>
                <input type='file' accept='image/*' multiple hidden onChange={handleImageSelect} />
              </label>
              {images.length > 0 && (
                <div className={formStyles.imagePreviewGrid}>
                  {images.map((img, i) => (
                    <div key={i} className={formStyles.imagePreview}>
                      <img src={img.preview} alt='' />
                      <button type='button' onClick={() => removeImage(i)}><X size={12} /></button>
                    </div>
                  ))}
                </div>
              )}
              {shipment?.images?.length > 0 && (
                <div className={formStyles.imagePreviewGrid} style={{ marginTop: 12 }}>
                  {shipment.images.map((img, i) => (
                    <div key={i} className={formStyles.imagePreview}>
                      <img src={img.url} alt='' />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className={formStyles.sideCol}>
            {isEdit && (
              <div className={styles.card}>
                <h3 className={styles.cardTitle}><Package size={16} /> Status Update</h3>
                <div className='form-group' style={{ marginBottom: 14 }}>
                  <label className='form-label'>Shipment Status</label>
                  <select className='form-input' {...register('status')}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className='form-group'>
                  <label className='form-label'>Remarks for this update</label>
                  <textarea className='form-input' rows={3} placeholder='e.g. Cleared customs at Lagos hub' value={remarks} onChange={e => setRemarks(e.target.value)} />
                </div>
                <p className={formStyles.hint}>Remarks are saved to the tracking timeline.</p>
              </div>
            )}

            <div className={styles.card}>
              <h3 className={styles.cardTitle}><Calendar size={16} /> Delivery & Pricing</h3>
              <div className='form-group' style={{ marginBottom: 14 }}>
                <label className='form-label'>Estimated Delivery</label>
                <input type='date' className='form-input' {...register('estimatedDelivery')} />
              </div>
              <div className={formStyles.row2}>
                <div className='form-group'>
                  <label className='form-label'>Price</label>
                  <input type='number' step='0.01' className='form-input' placeholder='0.00' {...register('price')} />
                </div>
                <div className='form-group'>
                  <label className='form-label'>Currency</label>
                  <select className='form-input' {...register('currency')}>
                    <option value='GBP'>GBP £</option>
                    <option value='NGN'>NGN ₦</option>
                    <option value='USD'>USD $</option>
                  </select>
                </div>
              </div>
            </div>

            {isEdit && shipment && (
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Tracking Timeline</h3>
                <ShipmentTimeline history={shipment.trackingHistory || []} currentStatus={watchedStatus} />
              </div>
            )}

            <button type='submit' className='btn btn-primary btn-lg' disabled={saving} style={{ width: '100%', justifyContent: 'center' }}>
              {saving ? <span className='loading-spinner' /> : <><Save size={16} /> {isEdit ? 'Save Changes' : 'Create Shipment'}</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
