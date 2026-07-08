import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Package, Bell, FileText, ArrowUpRight, Plus, MapPin } from 'lucide-react'
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { useAuth } from '../../context/AuthContext'
import StatusBadge from '../../components/ui/StatusBadge'
import styles from '../Dashboard.module.css'

export default function CustomerDashboard() {
  const { user } = useAuth()
  const [shipments, setShipments] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'Dashboard — TransBridge Logistics'
    if (user?.uid) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    try {
      // Query shipments where customerId matches logged in user uid
      const shipmentsQuery = query(
        collection(db, 'shipments'),
        where('customerId', '==', user.uid)
      )

      // Query notifications where userId matches logged in user uid
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(5)
      )

      const [shipmentsSnap, notificationsSnap] = await Promise.all([
        getDocs(shipmentsQuery),
        getDocs(notificationsQuery).catch(() => ({ docs: [] })) // Safe fallback if notifications query fails (e.g. index building)
      ])

      const fetchedShipments = shipmentsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      const fetchedNotifications = notificationsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      setShipments(fetchedShipments)
      setNotifications(fetchedNotifications)
    } catch (err) {
      console.error('Error loading dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  const activeCount = shipments.filter(s => s.status !== 'Delivered' && s.status !== 'Cancelled').length
  const deliveredCount = shipments.filter(s => s.status === 'Delivered').length

  if (loading) return <div className={styles.loadingWrap}><span className='loading-spinner' style={{ width: 32, height: 32 }} /></div>

  return (
    <div>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Welcome back, {user?.displayName || user?.email?.split('@')[0]} 👋</h1>
          <p className={styles.pageSub}>Here's an overview of your shipments and account activity.</p>
        </div>
        <Link to='/get-quote' className='btn btn-primary'><Plus size={16} /> Request a Shipment</Link>
      </div>

      <div className={styles.statsRow} style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className={styles.card} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(212,160,23,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gold-dark)' }}><Package size={20} /></div>
          <div><div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800 }}>{shipments.length}</div><div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Total Shipments</div></div>
        </div>
        <div className={styles.card} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(10,29,86,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-navy)' }}><MapPin size={20} /></div>
          <div><div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800 }}>{activeCount}</div><div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>In Progress</div></div>
        </div>
        <div className={styles.card} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(0,135,81,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-green)' }}><Package size={20} /></div>
          <div><div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800 }}>{deliveredCount}</div><div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Delivered</div></div>
        </div>
      </div>

      <div className={styles.grid2}>
        <motion.div className={styles.card} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 className={styles.cardTitle} style={{ marginBottom: 0 }}><Package size={16} /> Recent Shipments</h3>
            <Link to='/dashboard/shipments' className='btn btn-ghost btn-sm'>View All <ArrowUpRight size={14} /></Link>
          </div>
          {shipments.length === 0 ? (
            <div className={styles.emptyState} style={{ padding: '40px 20px' }}>
              <Package size={36} className={styles.emptyIcon} />
              <p style={{ color: 'var(--text-muted)', fontSize: 13.5 }}>No shipments yet. Get a quote to ship your first package.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {shipments.slice(0, 5).map(s => (
                <Link key={s.id} to={`/dashboard/shipments/${s.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border-color)', textDecoration: 'none' }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>{s.trackingNumber}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.origin} → {s.destination}</div>
                  </div>
                  <StatusBadge status={s.status} />
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div className={styles.card} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 className={styles.cardTitle} style={{ marginBottom: 0 }}><Bell size={16} /> Notifications</h3>
            <Link to='/dashboard/notifications' className='btn btn-ghost btn-sm'>View All <ArrowUpRight size={14} /></Link>
          </div>
          {notifications.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No notifications yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {notifications.map(n => (
                <div key={n.id} style={{ display: 'flex', gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.isRead ? 'var(--border-strong)' : 'var(--color-gold)', marginTop: 6, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{n.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{n.message}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
