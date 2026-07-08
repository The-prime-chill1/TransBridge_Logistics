import { Check, Circle, ArrowRight } from 'lucide-react'
import styles from './ShipmentTimeline.module.css'

const STATUS_ORDER = [
  'Shipment Created',
  'Picked Up',
  'Warehouse',
  'Departed UK',
  'In Transit',
  'Customs Clearance',
  'Arrived Nigeria',
  'Out for Delivery',
  'Delivered',
]

export default function ShipmentTimeline({ history = [], currentStatus }) {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus)

  // Build complete timeline merging history with status order
  const timeline = STATUS_ORDER.map((status, idx) => {
    const historyEntry = history.find(h => h.status === status)
    let state = 'pending'
    if (idx < currentIndex) state = 'done'
    else if (idx === currentIndex) state = 'active'
    return { status, state, timestamp: historyEntry?.timestamp, location: historyEntry?.location, remarks: historyEntry?.remarks }
  })

  return (
    <div className={styles.timeline}>
      {timeline.map((step, i) => (
        <div key={step.status} className={styles.step}>
          <div className={styles.indicator}>
            <div className={`${styles.dot} ${styles[step.state]}`}>
              {step.state === 'done' && <Check size={12} />}
              {step.state === 'active' && <ArrowRight size={12} />}
              {step.state === 'pending' && <Circle size={6} fill='currentColor' />}
            </div>
            {i < timeline.length - 1 && <div className={`${styles.line} ${step.state === 'done' ? styles.lineDone : ''}`} />}
          </div>
          <div className={styles.content}>
            <span className={`${styles.label} ${styles[step.state + 'Label']}`}>{step.status}</span>
            {step.timestamp && (
              <span className={styles.timestamp}>
                {new Date(step.timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                {step.location && ` · ${step.location}`}
              </span>
            )}
            {!step.timestamp && step.state === 'pending' && (
              <span className={styles.timestamp}>Pending</span>
            )}
            {step.remarks && <span className={styles.remarks}>{step.remarks}</span>}
          </div>
        </div>
      ))}
    </div>
  )
}
