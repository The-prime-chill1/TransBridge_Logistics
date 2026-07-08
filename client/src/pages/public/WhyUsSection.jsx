import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import styles from './WhyUsSection.module.css'

const POINTS = [
  { title: 'Secure International Shipping', sub: 'Every package insured and handled with the utmost care from origin to destination.' },
  { title: 'Real-Time Tracking', sub: 'Live updates at every stage so you always know exactly where your shipment is.' },
  { title: 'Dual-Channel OTP Verification', sub: 'Account security via both Email and SMS one-time passwords for every action.' },
  { title: 'Dedicated Customer Support', sub: 'UK and Nigeria WhatsApp lines available for fast, personal support.' },
  { title: 'Competitive Rates', sub: 'Transparent, affordable pricing with no hidden fees — just reliable service.' },
]

export default function WhyUsSection() {
  return (
    <section className={`section-padding ${styles.section}`}>
      <div className='container'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className='section-eyebrow'>Why TransBridge</span>
          <h2 className='section-title'>Trusted by Hundreds <span className='text-gradient-gold'>Across Both Nations</span></h2>
        </motion.div>

        <div className={styles.grid}>
          <motion.div
            className={styles.visual}
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className={styles.circle}>
              <div className={styles.circleInner}>
                <span className={styles.bigNum}>98%</span>
                <span className={styles.bigLabel}>Customer Satisfaction</span>
              </div>
            </div>
          </motion.div>

          <div className={styles.points}>
            {POINTS.map((p, i) => (
              <motion.div
                key={p.title}
                className={styles.point}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <div className={styles.check}><Check size={16} /></div>
                <div>
                  <div className={styles.pointTitle}>{p.title}</div>
                  <div className={styles.pointSub}>{p.sub}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
