import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Package, Hash, Bell, Camera, ArrowRight } from 'lucide-react'
import ShipmentTimeline from '../../components/ui/ShipmentTimeline'
import styles from './TrackingShowcase.module.css'

const DEMO_HISTORY = [
  { status: 'Shipment Created', timestamp: '2026-06-20T09:15:00', location: 'London, UK' },
  { status: 'Picked Up', timestamp: '2026-06-21T11:30:00', location: 'London, UK' },
  { status: 'Warehouse', timestamp: '2026-06-21T18:00:00', location: 'London Hub' },
  { status: 'Departed UK', timestamp: '2026-06-23T22:45:00', location: 'Heathrow Airport' },
  { status: 'In Transit', timestamp: '2026-06-24T06:00:00', location: 'In Flight' },
  { status: 'Customs Clearance', timestamp: '2026-06-27T08:00:00', location: 'Lagos, NG' },
  { status: 'Arrived Nigeria', timestamp: '2026-06-28T14:30:00', location: 'Lagos Hub' },
]

const STEPS = [
  { icon: Hash, title: 'Unique Tracking ID', sub: 'Auto-generated format: TB-2026-000001' },
  { icon: Bell, title: 'Live Status Updates', sub: 'Admin updates reflect instantly via Socket.io' },
  { icon: Package, title: 'SMS & Email Alerts', sub: 'Notifications sent at every key milestone' },
  { icon: Camera, title: 'Delivery Proof', sub: 'Photo confirmation upon successful delivery' },
]

export default function TrackingShowcase() {
  return (
    <section className={`section-padding ${styles.section}`}>
      <div className='container'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className='section-eyebrow'>Real-Time Tracking</span>
          <h2 className='section-title'>Know Where Your <span className='text-gradient-gold'>Package Is</span></h2>
        </motion.div>

        <div className={styles.wrapper}>
          <motion.div
            className={styles.demo}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className={styles.demoHeader}>
              <span className={styles.statusDot} />
              <span className={styles.statusText}>Out for Delivery</span>
              <span className={styles.trackNum}>TB-2026-000001</span>
            </div>
            <div className={styles.demoInfo}>
              <div className={styles.infoCell}><label>Origin</label><span>London, UK 🇬🇧</span></div>
              <div className={styles.infoCell}><label>Destination</label><span>Lagos, NG 🇳🇬</span></div>
              <div className={styles.infoCell}><label>Est. Delivery</label><span>30 Jun 2026</span></div>
              <div className={styles.infoCell}><label>Weight</label><span>12.5 kg</span></div>
              <div className={styles.infoCell}><label>Receiver</label><span>A. Okafor</span></div>
              <div className={styles.infoCell}><label>Service</label><span>Air Freight</span></div>
            </div>
            <div className={styles.demoTimeline}>
              <span className={styles.timelineTitle}>Shipment Timeline</span>
              <ShipmentTimeline history={DEMO_HISTORY} currentStatus='Out for Delivery' />
            </div>
          </motion.div>

          <motion.div
            className={styles.right}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <p className={styles.rightText}>
              Every TransBridge shipment comes with a unique tracking number. Monitor your package
              in real-time from pickup in the UK to delivery at the door in Nigeria.
            </p>
            <div className={styles.stepsList}>
              {STEPS.map(({ icon: Icon, title, sub }) => (
                <div key={title} className={styles.stepItem}>
                  <div className={styles.stepIcon}><Icon size={18} /></div>
                  <div>
                    <div className={styles.stepTitle}>{title}</div>
                    <div className={styles.stepSub}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>
            <Link to='/track' className='btn btn-primary' style={{ width: '100%', justifyContent: 'center' }}>
              <Package size={18} /> Track Your Shipment <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
