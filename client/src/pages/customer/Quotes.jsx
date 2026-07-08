import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Plus } from 'lucide-react'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { useAuth } from '../../context/AuthContext'
import StatusBadge from '../../components/ui/StatusBadge'
import styles from '../Dashboard.module.css'

export default function CustomerQuotes() {
  const { user } = useAuth()
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'My Quotes — TransBridge'
    if (user?.uid) load()
  }, [user])

  const load = async () => {
    try {
      const q = query(
        collection(db, 'quotes'),
        where('userId', '==', user.uid)
      )
      const snap = await getDocs(q)
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      // Sort by createdAt in memory
      list.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
        return dateB - dateA
      })
      setQuotes(list)
    } catch (err) {
      console.error('Failed to load quotes:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (val) => {
    if (!val) return '—'
    const d = val?.toDate ? val.toDate() : new Date(val)
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
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
                <tr key={q.id}>
                  <td className={styles.cellPrimary}>{q.serviceType}</td>
                  <td className={styles.cellMuted}>{q.origin} → {q.destination}</td>
                  <td><StatusBadge status={q.status} /></td>
                  <td>{q.quotedPrice ? `${q.currency || 'GBP'} ${q.quotedPrice}` : '—'}</td>
                  <td className={styles.cellMuted}>{formatDate(q.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
