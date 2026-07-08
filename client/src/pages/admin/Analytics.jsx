import { useState, useEffect } from 'react'
import { TrendingUp, PoundSterling, Package, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import { analyticsAPI } from '../../services/api'
import styles from '../Dashboard.module.css'

export default function AdminAnalytics() {
  const [revenue, setRevenue] = useState([])
  const [shipmentData, setShipmentData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('monthly')

  useEffect(() => {
    document.title = 'Analytics — Admin'
    load()
  }, [period])

  const load = async () => {
    setLoading(true)
    try {
      const [revRes, shipRes] = await Promise.all([
        analyticsAPI.getRevenue({ period }),
        analyticsAPI.getShipmentStats({ period }),
      ])
      setRevenue(revRes.data.revenue)
      setShipmentData(shipRes.data)
    } catch {
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className={styles.loadingWrap}><span className='loading-spinner' style={{ width: 32, height: 32 }} /></div>

  const maxRevenue = Math.max(...revenue.map(r => r.total), 1)
  const maxShipments = Math.max(...(shipmentData?.byDate || []).map(d => d.count), 1)
  const totalRevenue = revenue.reduce((sum, r) => sum + r.total, 0)
  const totalShipmentCount = (shipmentData?.byDate || []).reduce((sum, d) => sum + d.count, 0)

  return (
    <div>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Analytics</h1>
          <p className={styles.pageSub}>Revenue and shipment performance insights</p>
        </div>
        <select className={styles.filterSelect} value={period} onChange={e => setPeriod(e.target.value)}>
          <option value='daily'>Daily</option>
          <option value='monthly'>Monthly</option>
          <option value='yearly'>Yearly</option>
        </select>
      </div>

      <div className={styles.statsRow} style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <div className={styles.card} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(0,135,81,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-green)' }}>
            <PoundSterling size={22} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800 }}>£{totalRevenue.toLocaleString()}</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Total Revenue (Paid)</div>
          </div>
        </div>
        <div className={styles.card} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(212,160,23,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gold-dark)' }}>
            <Package size={22} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800 }}>{totalShipmentCount.toLocaleString()}</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Shipments This Period</div>
          </div>
        </div>
      </div>

      <div className={styles.grid2} style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* Revenue Chart */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}><TrendingUp size={16} /> Revenue Trend</h3>
          {revenue.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No revenue data yet.</p>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 180, paddingTop: 10 }}>
              {revenue.map(r => (
                <div key={r._id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: '100%', maxWidth: 32,
                    height: `${(r.total / maxRevenue) * 140}px`,
                    background: 'var(--gradient-gold)',
                    borderRadius: '4px 4px 0 0',
                    minHeight: 4,
                  }} title={`£${r.total}`} />
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', writingMode: 'vertical-rl', textOrientation: 'mixed' }}>{r._id}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Shipment Volume Chart */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}><Package size={16} /> Shipment Volume</h3>
          {(!shipmentData?.byDate || shipmentData.byDate.length === 0) ? (
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No shipment data yet.</p>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 180, paddingTop: 10 }}>
              {shipmentData.byDate.map(d => (
                <div key={d._id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: '100%', maxWidth: 32,
                    height: `${(d.count / maxShipments) * 140}px`,
                    background: 'var(--gradient-navy)',
                    borderRadius: '4px 4px 0 0',
                    minHeight: 4,
                  }} title={`${d.count} shipments`} />
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', writingMode: 'vertical-rl', textOrientation: 'mixed' }}>{d._id}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.grid2} style={{ gridTemplateColumns: '1fr 1fr', marginTop: 20 }}>
        {/* By Courier */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>By Courier Type</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(shipmentData?.byCourier || []).map(c => {
              const max = Math.max(...(shipmentData.byCourier || []).map(x => x.count), 1)
              return (
                <div key={c._id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 5 }}>
                    <span>{c._id}</span><span style={{ color: 'var(--text-muted)' }}>{c.count}</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg-secondary)', borderRadius: 4 }}>
                    <div style={{ height: '100%', width: `${(c.count / max) * 100}%`, background: 'var(--gradient-gold)', borderRadius: 4 }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top Destinations */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}><MapPin size={16} /> Top Destinations</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(shipmentData?.byDestination || []).slice(0, 6).map((d, i) => (
              <div key={d._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)' }}>{i + 1}. {d._id}</span>
                <span className='badge badge-info'>{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
