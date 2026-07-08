import { useState, useEffect } from 'react'
import { CreditCard, Download } from 'lucide-react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { useAuth } from '../../context/AuthContext'
import styles from '../Dashboard.module.css'

// Invoices are derived from shipments that have a price set
export default function CustomerInvoices() {
  const { user } = useAuth()
  const [shipments, setShipments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'Invoices — TransBridge'
    if (user?.uid) load()
  }, [user])

  const load = async () => {
    try {
      const q = query(
        collection(db, 'shipments'),
        where('customerId', '==', user.uid)
      )
      const snap = await getDocs(q)
      const list = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(s => s.price > 0)
        .sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
          return dateB - dateA
        })
      setShipments(list)
    } catch (err) {
      console.error('Failed to load invoices:', err)
    } finally {
      setLoading(false)
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
          <h1 className={styles.pageTitle}>Invoices</h1>
          <p className={styles.pageSub}>Billing history for your shipments</p>
        </div>
      </div>

      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.loadingWrap}><span className='loading-spinner' style={{ width: 28, height: 28 }} /></div>
        ) : shipments.length === 0 ? (
          <div className={styles.emptyState}>
            <CreditCard size={40} className={styles.emptyIcon} />
            <p>No invoices yet.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead><tr><th>Tracking #</th><th>Service</th><th>Amount</th><th>Payment Status</th><th>Date</th><th></th></tr></thead>
            <tbody>
              {shipments.map(s => (
                <tr key={s.id}>
                  <td className={styles.cellPrimary}>{s.trackingNumber}</td>
                  <td className={styles.cellMuted}>{s.courier || s.serviceType || '—'}</td>
                  <td>{s.currency || 'GBP'} {Number(s.price).toLocaleString()}</td>
                  <td><span className={`badge badge-${s.paymentStatus === 'Paid' ? 'success' : 'warning'}`}>{s.paymentStatus || 'Pending'}</span></td>
                  <td className={styles.cellMuted}>{formatDate(s.createdAt)}</td>
                  <td>
                    <button className={styles.iconBtnSm} title='Download invoice'>
                      <Download size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
