import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Plus, Package, Eye, Pencil, Archive, ChevronLeft, ChevronRight } from 'lucide-react'
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { db } from '../../config/firebase'
import StatusBadge from '../../components/ui/StatusBadge'
import styles from '../Dashboard.module.css'

const STATUSES = [
  'Shipment Created', 'Picked Up', 'Warehouse', 'Departed UK', 'In Transit',
  'Customs Clearance', 'Arrived Nigeria', 'Out for Delivery', 'Delivered', 'Cancelled', 'On Hold',
]

export default function AdminShipments() {
  const [allShipments, setAllShipments] = useState([])
  const [shipments, setShipments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 })
  const navigate = useNavigate()
  const PAGE_SIZE = 15

  useEffect(() => {
    document.title = 'Shipments — Admin'
    loadAll()
  }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const snap = await getDocs(collection(db, 'shipments'))
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      list.sort((a, b) => {
        const da = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
        const db2 = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
        return db2 - da
      })
      setAllShipments(list)
    } catch (err) {
      toast.error('Failed to load shipments')
    } finally {
      setLoading(false)
    }
  }

  // Filter + paginate in memory
  useEffect(() => {
    const q = search.toLowerCase()
    const filtered = allShipments.filter(s => {
      const matchSearch = !q ||
        s.trackingNumber?.toLowerCase().includes(q) ||
        s.origin?.toLowerCase().includes(q) ||
        s.destination?.toLowerCase().includes(q) ||
        s.receiverName?.toLowerCase().includes(q)
      const matchStatus = !status || s.status === status
      return matchSearch && matchStatus
    })
    const pages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1)
    const offset = (page - 1) * PAGE_SIZE
    setShipments(filtered.slice(offset, offset + PAGE_SIZE))
    setPagination({ total: filtered.length, pages, page })
  }, [allShipments, search, status, page])

  const handleArchive = async (id, trackingNumber) => {
    if (!confirm(`Archive shipment ${trackingNumber}? This can be restored later.`)) return
    try {
      await deleteDoc(doc(db, 'shipments', id))
      toast.success('Shipment archived')
      setAllShipments(prev => prev.filter(s => s.id !== id))
    } catch {
      toast.error('Failed to archive shipment')
    }
  }

  const formatDate = (val) => {
    if (!val) return '—'
    const d = val?.toDate ? val.toDate() : new Date(val)
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  return (
    <div>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Shipments</h1>
          <p className={styles.pageSub}>{pagination.total} total shipments</p>
        </div>
        <Link to='/admin/shipments/new' className='btn btn-primary'>
          <Plus size={16} /> New Shipment
        </Link>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder='Search by tracking number, receiver, origin, destination...'
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <select className={styles.filterSelect} value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>
          <option value=''>All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.loadingWrap}><span className='loading-spinner' style={{ width: 28, height: 28 }} /></div>
        ) : shipments.length === 0 ? (
          <div className={styles.emptyState}>
            <Package size={40} className={styles.emptyIcon} />
            <p>No shipments found. Create your first shipment to get started.</p>
          </div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tracking #</th>
                  <th>Receiver</th>
                  <th>Route</th>
                  <th>Courier</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {shipments.map(s => (
                  <tr key={s.id} className={styles.clickableRow} onClick={() => navigate(`/admin/shipments/${s.id}/edit`)}>
                    <td className={styles.cellPrimary}>{s.trackingNumber}</td>
                    <td>{s.receiverName || '—'}</td>
                    <td className={styles.cellMuted}>{s.origin} → {s.destination}</td>
                    <td>{s.courier}</td>
                    <td><StatusBadge status={s.status} /></td>
                    <td className={styles.cellMuted}>{formatDate(s.createdAt)}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className={styles.actionsCell}>
                        <Link to={`/track/${s.trackingNumber}`} target='_blank' className={styles.iconBtnSm} title='View public tracking'>
                          <Eye size={14} />
                        </Link>
                        <Link to={`/admin/shipments/${s.id}/edit`} className={styles.iconBtnSm} title='Edit'>
                          <Pencil size={14} />
                        </Link>
                        <button className={`${styles.iconBtnSm} ${styles.danger}`} title='Archive' onClick={() => handleArchive(s.id, s.trackingNumber)}>
                          <Archive size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={styles.pagination}>
              <span>Page {pagination.page} of {pagination.pages}</span>
              <div className={styles.pageBtns}>
                <button className={styles.pageBtn} disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft size={14} />
                </button>
                <button className={styles.pageBtn} disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
