import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Package, Users, TrendingUp, Clock, Truck,
  HeadphonesIcon, FileText, ArrowUpRight, PoundSterling
} from 'lucide-react'
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore'
import { db } from '../../config/firebase'
import StatCard from '../../components/ui/StatCard'
import StatusBadge from '../../components/ui/StatusBadge'
import styles from '../Dashboard.module.css'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalShipments: 0,
    inTransitShipments: 0,
    revenue: 0,
    pendingShipments: 0,
    pendingQuotes: 0,
    openTickets: 0,
  })
  const [recentShipments, setRecentShipments] = useState([])
  const [statusBreakdown, setStatusBreakdown] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'Admin Dashboard — TransBridge Logistics'
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      // Fetch all collections in parallel
      const [customersSnap, shipmentsSnap, quotesSnap] = await Promise.all([
        getDocs(query(collection(db, 'users'), where('role', '==', 'customer'))),
        getDocs(collection(db, 'shipments')),
        getDocs(query(collection(db, 'quotes'), where('status', '==', 'Pending'))),
      ])

      const shipments = shipmentsSnap.docs.map(d => ({ id: d.id, ...d.data() }))

      // Compute stats from Firestore data
      const inTransit = shipments.filter(s => s.status === 'In Transit').length
      const pending = shipments.filter(s => s.status === 'Pending').length

      // Build status breakdown
      const statusMap = {}
      shipments.forEach(s => {
        statusMap[s.status] = (statusMap[s.status] || 0) + 1
      })
      const breakdown = Object.entries(statusMap).map(([status, count]) => ({ _id: status, count }))

      // Recent 5 shipments (sorted by createdAt desc in memory)
      const sorted = [...shipments].sort((a, b) => {
        const da = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
        const db_ = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
        return db_ - da
      }).slice(0, 5)

      setStats({
        totalCustomers: customersSnap.size,
        totalShipments: shipmentsSnap.size,
        inTransitShipments: inTransit,
        revenue: 0, // Revenue tracking can be added later
        pendingShipments: pending,
        pendingQuotes: quotesSnap.size,
        openTickets: 0,
      })
      setRecentShipments(sorted)
      setStatusBreakdown(breakdown)
    } catch (err) {
      console.error('Failed to load dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className={styles.loadingWrap}><span className='loading-spinner' style={{ width: 32, height: 32 }} /></div>
  }

  return (
    <div>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Overview</h1>
          <p className={styles.pageSub}>Welcome back. Here's what's happening across TransBridge today.</p>
        </div>
        <Link to='/admin/shipments/new' className='btn btn-primary'>
          <Package size={16} /> New Shipment
        </Link>
      </div>

      <div className={styles.statsRow}>
        <StatCard icon={Users} label='Total Customers' value={stats.totalCustomers.toLocaleString()} color='navy' />
        <StatCard icon={Package} label='Total Shipments' value={stats.totalShipments.toLocaleString()} color='gold' />
        <StatCard icon={Truck} label='In Transit' value={stats.inTransitShipments.toLocaleString()} color='warning' />
        <StatCard icon={PoundSterling} label='Revenue (Paid)' value={`£${stats.revenue.toLocaleString()}`} color='green' />
      </div>

      <div className={styles.statsRow} style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <StatCard icon={Clock} label='Pending Shipments' value={stats.pendingShipments} color='gold' />
        <StatCard icon={FileText} label='Quote Requests' value={stats.pendingQuotes} color='navy' />
        <StatCard icon={HeadphonesIcon} label='Open Support Tickets' value={stats.openTickets} color='red' />
      </div>

      <div className={styles.grid2}>
        {/* Recent Shipments */}
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 className={styles.cardTitle} style={{ marginBottom: 0 }}><Package size={16} /> Recent Shipments</h3>
            <Link to='/admin/shipments' className='btn btn-ghost btn-sm'>View All <ArrowUpRight size={14} /></Link>
          </div>
          <div className={styles.tableWrap} style={{ border: 'none' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tracking #</th>
                  <th>Customer</th>
                  <th>Route</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentShipments.map(s => (
                  <tr key={s.id} className={styles.clickableRow}>
                    <td className={styles.cellPrimary}>{s.trackingNumber}</td>
                    <td>{s.customerName || s.customer?.displayName || '—'}</td>
                    <td className={styles.cellMuted}>{s.origin} → {s.destination}</td>
                    <td><StatusBadge status={s.status} /></td>
                  </tr>
                ))}
                {recentShipments.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No shipments yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Status Breakdown */}
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h3 className={styles.cardTitle}><TrendingUp size={16} /> Status Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {statusBreakdown.map(s => {
              const max = Math.max(...statusBreakdown.map(x => x.count), 1)
              const pct = (s.count / max) * 100
              return (
                <div key={s._id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 5 }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{s._id}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{s.count}</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg-secondary)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'var(--gradient-gold)', borderRadius: 4 }} />
                  </div>
                </div>
              )
            })}
            {statusBreakdown.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No data yet</p>}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
