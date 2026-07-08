import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { quoteAPI } from '../../services/api'
import StatusBadge from '../../components/ui/StatusBadge'
import styles from '../Dashboard.module.css'

export default function CustomerQuotes() {
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'My Quotes — TransBridge'
    load()
  }, [])

  const load = async () => {
    try {
      const res = await quoteAPI.getMyQuotes()
      setQuotes(res.data.quotes)
    } catch {
      toast.error('Failed to load quotes')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>My Quotes</h1>
          <p className={styles.pageSub}>Track your quote requests and responses</p>
        </div>
        <Link to='/get-quote' className='btn btn-primary'><Plus size={16} /> New Quote Request</Link>
      </div>

      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.loadingWrap}><span className='loading-spinner' style={{ width: 28, height: 28 }} /></div>
        ) : quotes.length === 0 ? (
          <div className={styles.emptyState}>
            <FileText size={40} className={styles.emptyIcon} />
            <p>No quote requests yet.</p>
            <Link to='/get-quote' className='btn btn-primary' style={{ marginTop: 16 }}>Request a Quote</Link>
          </div>
        ) : (
          <table className={styles.table}>
            <thead><tr><th>Service</th><th>Route</th><th>Status</th><th>Quoted Price</th><th>Submitted</th></tr></thead>
            <tbody>
              {quotes.map(q => (
                <tr key={q._id}>
                  <td className={styles.cellPrimary}>{q.serviceType}</td>
                  <td className={styles.cellMuted}>{q.origin} → {q.destination}</td>
                  <td><StatusBadge status={q.status} /></td>
                  <td>{q.quotedPrice ? `${q.currency} ${q.quotedPrice}` : '—'}</td>
                  <td className={styles.cellMuted}>{new Date(q.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
