import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { MapPin, Plus, Pencil, Trash2, X, Star } from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import styles from '../Dashboard.module.css'

export default function CustomerAddresses() {
  const { user, updateUser } = useAuth()
  const [addresses, setAddresses] = useState(user?.addresses || [])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => { document.title = 'Saved Addresses — TransBridge' }, [])

  const openNew = () => { setEditingId(null); reset({ label: 'Home', fullName: '', street: '', city: '', state: '', postalCode: '', country: '', phone: '', isDefault: false }); setModalOpen(true) }
  const openEdit = (addr) => { setEditingId(addr._id); reset(addr); setModalOpen(true) }

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      const endpoint = editingId ? `/users/addresses/${editingId}` : '/users/addresses'
      const res = editingId ? await api.put(endpoint, data) : await api.post(endpoint, data)
      setAddresses(res.data.addresses)
      updateUser({ addresses: res.data.addresses })
      toast.success(editingId ? 'Address updated' : 'Address added')
      setModalOpen(false)
    } catch (err) {
      toast.error('Failed to save address')
    } finally {
      setSaving(false)
    }
  }

  const deleteAddress = async (id) => {
    if (!confirm('Delete this address?')) return
    try {
      const res = await api.delete(`/users/addresses/${id}`)
      setAddresses(res.data.addresses)
      updateUser({ addresses: res.data.addresses })
      toast.success('Address deleted')
    } catch {
      toast.error('Failed to delete address')
    }
  }

  return (
    <div>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Saved Addresses</h1>
          <p className={styles.pageSub}>Manage pickup and delivery addresses</p>
        </div>
        <button className='btn btn-primary' onClick={openNew}><Plus size={16} /> Add Address</button>
      </div>

      {addresses.length === 0 ? (
        <div className={styles.card}>
          <div className={styles.emptyState}>
            <MapPin size={40} className={styles.emptyIcon} />
            <p>No saved addresses yet.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {addresses.map(addr => (
            <div key={addr._id} className={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{addr.label}</span>
                  {addr.isDefault && <span className='badge badge-success'><Star size={10} /> Default</span>}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className={styles.iconBtnSm} onClick={() => openEdit(addr)}><Pencil size={13} /></button>
                  <button className={`${styles.iconBtnSm} ${styles.danger}`} onClick={() => deleteAddress(addr._id)}><Trash2 size={13} /></button>
                </div>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {addr.fullName}<br />
                {addr.street}, {addr.city}<br />
                {addr.state} {addr.postalCode}, {addr.country}<br />
                {addr.phone}
              </p>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className='overlay' onClick={() => setModalOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 460, maxWidth: '90vw', background: 'var(--bg-primary)', borderRadius: 16, padding: 28, maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800 }}>{editingId ? 'Edit Address' : 'New Address'}</h2>
              <button className={styles.iconBtnSm} onClick={() => setModalOpen(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className='form-group' style={{ marginBottom: 14 }}>
                <label className='form-label'>Label</label>
                <input className='form-input' placeholder='Home, Office...' {...register('label', { required: true })} />
              </div>
              <div className='form-group' style={{ marginBottom: 14 }}>
                <label className='form-label'>Full Name</label>
                <input className='form-input' {...register('fullName', { required: true })} />
              </div>
              <div className='form-group' style={{ marginBottom: 14 }}>
                <label className='form-label'>Street Address</label>
                <input className='form-input' {...register('street', { required: true })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div className='form-group'><label className='form-label'>City</label><input className='form-input' {...register('city', { required: true })} /></div>
                <div className='form-group'><label className='form-label'>State/Region</label><input className='form-input' {...register('state')} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div className='form-group'><label className='form-label'>Postal Code</label><input className='form-input' {...register('postalCode')} /></div>
                <div className='form-group'><label className='form-label'>Country</label><input className='form-input' {...register('country', { required: true })} /></div>
              </div>
              <div className='form-group' style={{ marginBottom: 20 }}>
                <label className='form-label'>Phone</label>
                <input className='form-input' {...register('phone', { required: true })} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 20, cursor: 'pointer' }}>
                <input type='checkbox' {...register('isDefault')} /> Set as default address
              </label>
              <button type='submit' className='btn btn-primary' disabled={saving} style={{ width: '100%', justifyContent: 'center' }}>
                {saving ? <span className='loading-spinner' /> : 'Save Address'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
