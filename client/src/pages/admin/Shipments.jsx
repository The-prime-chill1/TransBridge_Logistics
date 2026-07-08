import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Plus, Package, Eye, Pencil, Archive, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { shipmentAPI } from '../../services/api'
import StatusBadge from '../../components/ui/StatusBadge'
import styles from '../Dashboard.module.css'

const STATUSES = [
  'Shipment Created', 'Picked Up', 'Warehouse', 'Departed UK', 'In Transit',
  'Customs Clearance', 'Arrived Nigeria', 'Out for Delivery', 'Delivered', 'Cancelled', 'On Hold',
]

export default function AdminShipments() {
  const [shipments, setShipments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, pages: 1 })
  const navigate = useNavigate()

  const loadShipments = useCallback(async () => {
    setLoading(true)
    try {
      const res = await shipmentAPI.getAll({ search, status, page, limit: 15 })
      setShipments(res.data.shipments)
      setPagination(res.data.pagination)
    } catch (err) {
      toast.error('Failed to load shipments')
    } finally {
      setLoading(false)
    }
  }, [search, status, page])

  useEffect(() => {
    document.title = 'Shipments — Admin'
    const t = setTimeout(loadShipments, 300)
    return () => clearTimeout(t)
  }, [loadShipments])

  const handleArchive = async (id, trackingNumber) => {
    if (!confirm(`Archive shipment ${trackingNumber}? This can be restored later.`)) return
    try {
      await shipmentAPI.delete(id)
      toast.success('Shipment archived')
      loadShipments()
    } catch {
      toast.error('Failed to archive shipment')
    }
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
                  <th>Customer</th>
                  <th>Route</th>
                  <th>Courier</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {shipments.map(s => (
                  <tr key={s._id} className={styles.clickableRow} onClick={() => navigate(`/admin/shipments/${s._id}/edit`)}>
                    <td className={styles.cellPrimary}>{s.trackingNumber}</td>
                    <td>{s.customer?.firstName} {s.customer?.lastName}<br /><span className={styles.cellMuted}>{s.customer?.email}</span></td>
                    <td className={styles.cellMuted}>{s.origin} → {s.destination}</td>
                    <td>{s.courier}</td>
                    <td><StatusBadge status={s.status} /></td>
                    <td className={styles.cellMuted}>{new Date(s.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className={styles.actionsCell}>
                        <Link to={`/track/${s.trackingNumber}`} target='_blank' className={styles.iconBtnSm} title='View public tracking'>
                          <Eye size={14} />
                        </Link>
                        <Link to={`/admin/shipments/${s._id}/edit`} className={styles.iconBtnSm} title='Edit'>
                          <Pencil size={14} />
                        </Link>
                        <button className={`${styles.iconBtnSm} ${styles.danger}`} title='Archive' onClick={() => handleArchive(s._id, s.trackingNumber)}>
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
