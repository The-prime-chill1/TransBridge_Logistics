import { useState, useEffect } from 'react'
import { Bell, CheckCheck, Package, FileText, HeadphonesIcon, ShieldAlert } from 'lucide-react'
import toast from 'react-hot-toast'
import { notificationAPI } from '../../services/api'
import styles from '../Dashboard.module.css'

const ICONS = {
  shipment_created: Package, shipment_updated: Package, shipment_delivered: Package,
  quote_response: FileText, support_reply: HeadphonesIcon, security_alert: ShieldAlert, system: Bell,
}

export default function CustomerNotifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { document.title = 'Notifications — TransBridge'; load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const res = await notificationAPI.getAll({ limit: 50 })
      setNotifications(res.data.notifications)
    } catch {
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const markAllRead = async () => {
    try {
      await notificationAPI.markAllRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch {
      toast.error('Failed to update notifications')
    }
  }

  const markRead = async (id) => {
    try {
      await notificationAPI.markRead(id)
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
    } catch {}
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
                <div key={n._id} onClick={() => !n.isRead && markRead(n._id)} style={{ display: 'flex', gap: 14, padding: '16px 22px', borderBottom: '1px solid var(--border-color)', cursor: n.isRead ? 'default' : 'pointer', background: n.isRead ? 'transparent' : 'rgba(212,160,23,0.04)' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(212,160,23,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--color-gold-dark)' }}>
                    <Icon size={17} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>{n.title}</span>
                      {!n.isRead && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-gold)', flexShrink: 0, marginTop: 5 }} />}
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>{n.message}</p>
                    <span style={{ fontSize: 11.5, color: 'var(--text-light)', marginTop: 4, display: 'block' }}>
                      {new Date(n.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
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
