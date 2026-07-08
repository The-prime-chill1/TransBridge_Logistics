import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Package, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { useAuth } from '../../context/AuthContext'
import StatusBadge from '../../components/ui/StatusBadge'
import styles from '../Dashboard.module.css'

export default function CustomerShipments() {
  const { user } = useAuth()
  const [shipments, setShipments] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, pages: 1 })

  const loadShipments = useCallback(async () => {
    if (!user?.uid) return
    setLoading(true)
    try {
      // Query customer shipments
      let shipmentsQuery = query(
        collection(db, 'shipments'),
        where('customerId', '==', user.uid)
      )

      const snap = await getDocs(shipmentsQuery)
      let list = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      // Apply filtering in memory (simpler than firestore compound queries requiring index)
      if (status) {
        list = list.filter(s => s.status === status)
      }

      // Memory pagination
      const limit = 10
      const total = list.length
      const pages = Math.max(Math.ceil(total / limit), 1)
      const offset = (page - 1) * limit
      const paginatedList = list.slice(offset, offset + limit)

      setShipments(paginatedList)
      setPagination({ total, pages, page })
    } catch (err) {
      console.error(err)
      toast.error('Failed to load shipments')
    } finally {
      setLoading(false)
    }
  }, [user, status, page])

  useEffect(() => {
    document.title = 'My Shipments — TransBridge'
    loadShipments()
  }, [loadShipments])

  return (
    <div>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>My Shipments</h1>
          <p className={styles.pageSub}>{pagination.total} total shipments</p>
        </div>
      </div>

      <div className={styles.toolbar}>
        <select className={styles.filterSelect} value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>
          <option value=''>All Statuses</option>
          <option value='Shipment Created'>Shipment Created</option>
          <option value='In Transit'>In Transit</option>
          <option value='Customs Clearance'>Customs Clearance</option>
          <option value='Out for Delivery'>Out for Delivery</option>
          <option value='Delivered'>Delivered</option>
        </select>
      </div>

      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.loadingWrap}><span className='loading-spinner' style={{ width: 28, height: 28 }} /></div>
        ) : shipments.length === 0 ? (
          <div className={styles.emptyState}>
            <Package size={40} className={styles.emptyIcon} />
            <p>No shipments found. Get a quote to start shipping.</p>
            <Link to='/get-quote' className='btn btn-primary' style={{ marginTop: 16 }}>Get a Quote</Link>
          </div>
        ) : (
          <>
            <table className={styles.table}>
              <thead><tr><th>Tracking #</th><th>Route</th><th>Courier</th><th>Status</th><th>Est. Delivery</th></tr></thead>
              <tbody>
                {shipments.map(s => (
                  <tr key={s.id} className={styles.clickableRow}>
                    <td className={styles.cellPrimary}>
                      <Link to={`/dashboard/shipments/${s.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{s.trackingNumber}</Link>
                    </td>
                    <td className={styles.cellMuted}>{s.origin} → {s.destination}</td>
                    <td>{s.courier || '—'}</td>
                    <td><StatusBadge status={s.status} /></td>
                    <td className={styles.cellMuted}>
                      {s.estimatedDelivery 
                        ? (s.estimatedDelivery.toDate 
                            ? s.estimatedDelivery.toDate() 
                            : new Date(s.estimatedDelivery)
                          ).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
                        : 'TBD'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className={styles.pagination}>
              <span>Page {pagination.page} of {pagination.pages}</span>
              <div className={styles.pageBtns}>
                <button className={styles.pageBtn} disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /></button>
                <button className={styles.pageBtn} disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
