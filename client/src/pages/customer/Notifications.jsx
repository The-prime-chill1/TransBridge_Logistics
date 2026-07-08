import { useState, useEffect } from 'react'
import { Bell, CheckCheck, Package, FileText, HeadphonesIcon, ShieldAlert } from 'lucide-react'
import { collection, query, where, orderBy, limit, getDocs, updateDoc, doc, writeBatch } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { useAuth } from '../../context/AuthContext'
import styles from '../Dashboard.module.css'

const ICONS = {
  shipment_created: Package, shipment_updated: Package, shipment_delivered: Package,
  quote_response: FileText, support_reply: HeadphonesIcon, security_alert: ShieldAlert, system: Bell,
}

export default function CustomerNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'Notifications — TransBridge'
    if (user?.uid) load()
  }, [user])

  const load = async () => {
    setLoading(true)
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(50)
      )
      const snap = await getDocs(q)
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (err) {
      console.error('Failed to load notifications:', err)
      // If Firestore index isn't ready yet, load without ordering
      try {
        const fallbackQ = query(
          collection(db, 'notifications'),
          where('userId', '==', user.uid),
          limit(50)
        )
        const fallbackSnap = await getDocs(fallbackQ)
        setNotifications(fallbackSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (e) {
        console.error('Fallback also failed:', e)
      }
    } finally {
      setLoading(false)
    }
  }

  const markAllRead = async () => {
    try {
      const batch = writeBatch(db)
      notifications.filter(n => !n.isRead).forEach(n => {
        batch.update(doc(db, 'notifications', n.id), { isRead: true })
      })
      await batch.commit()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch (err) {
      console.error('Failed to mark all read:', err)
    }
  }

  const markRead = async (id) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { isRead: true })
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    } catch {}
  }

  const formatDate = (val) => {
    if (!val) return ''
    const d = val?.toDate ? val.toDate() : new Date(val)
    return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Notifications</h1>
          <p className={styles.pageSub}>Updates on your shipments, quotes, and support tickets</p>
        </div>
        <button className='btn btn-ghost' onClick={markAllRead}><CheckCheck size={16} /> Mark All Read</button>
      </div>

      <div className={styles.card} style={{ padding: 0 }}>
        {loading ? (
          <div className={styles.loadingWrap}><span className='loading-spinner' style={{ width: 28, height: 28 }} /></div>
        ) : notifications.length === 0 ? (
          <div className={styles.emptyState}><Bell size={40} className={styles.emptyIcon} /><p>No notifications yet.</p></div>
        ) : (
          <div>
            {notifications.map(n => {
              const Icon = ICONS[n.type] || Bell
              return (
                <div key={n.id} onClick={() => !n.isRead && markRead(n.id)} style={{ display: 'flex', gap: 14, padding: '16px 22px', borderBottom: '1px solid var(--border-color)', cursor: n.isRead ? 'default' : 'pointer', background: n.isRead ? 'transparent' : 'rgba(212,160,23,0.04)' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(212,160,23,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--color-gold-dark)' }}>
                    <Icon size={17} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>{n.title}</span>
                      {!n.isRead && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-gold)', flexShrink: 0, marginTop: 5 }} />}
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>{n.message}</p>
                    <span style={{ fontSize: 11.5, color: 'var(--text-light)', marginTop: 4, display: 'block' }}>{formatDate(n.createdAt)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
