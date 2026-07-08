import { motion } from 'framer-motion'
import { Plane, Ship, Home as HomeIcon, ShieldCheck } from 'lucide-react'
import styles from './RouteSection.module.css'

const FEATURES = [
  { icon: Plane, label: 'Air Freight', value: '5–8 business days' },
  { icon: Ship, label: 'Sea Freight', value: '14–21 business days' },
  { icon: HomeIcon, label: 'Door-to-Door', value: 'Full pickup & delivery' },
  { icon: ShieldCheck, label: 'Customs Cleared', value: 'Hassle-free clearance' },
]

export default function RouteSection() {
  return (
    <section className={`section-padding ${styles.section}`}>
      <div className='container'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className='section-eyebrow'>Our Route</span>
          <h2 className='section-title'>Direct UK — Nigeria <span className='text-gradient-gold'>Connection</span></h2>
        </motion.div>

        <motion.div
          className={styles.routeGrid}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <div className={styles.city}>
            <div className={styles.flag}>🇬🇧</div>
            <h3 className={styles.cityName}>United Kingdom</h3>
            <p className={styles.citySub}>London · Birmingham · Manchester</p>
          </div>

          <div className={styles.path}>
            <span className={styles.pathLabel}>Air & Sea Freight</span>
            <div className={styles.pathLine}>
              <div className={styles.line} />
              <Plane size={20} className={styles.plane} />
            </div>
            <span className={styles.pathTime}>7–21 Days</span>
            <span className={styles.pathLabel}>Door-to-Door</span>
          </div>

          <div className={styles.city}>
            <div className={styles.flag}>🇳🇬</div>
            <h3 className={styles.cityName}>Nigeria</h3>
            <p className={styles.citySub}>Lagos · Abuja · Port Harcourt</p>
          </div>
        </motion.div>

        <div className={styles.featuresGrid}>
          {FEATURES.map(({ icon: Icon, label, value }, i) => (
            <motion.div
              key={label}
              className={styles.featCard}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className={styles.featIcon}><Icon size={24} /></div>
              <span className={styles.featLabel}>{label}</span>
              <span className={styles.featValue}>{value}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
