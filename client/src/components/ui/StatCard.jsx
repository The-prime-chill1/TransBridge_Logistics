import { motion } from 'framer-motion'
import styles from './StatCard.module.css'

export default function StatCard({ icon: Icon, label, value, trend, trendUp, color = 'gold' }) {
  return (
    <motion.div
      className={styles.card}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <div className={`${styles.iconWrap} ${styles[color]}`}>
        <Icon size={20} />
      </div>
      <div className={styles.body}>
        <span className={styles.value}>{value}</span>
        <span className={styles.label}>{label}</span>
      </div>
      {trend && (
        <div className={`${styles.trend} ${trendUp ? styles.up : styles.down}`}>
          {trendUp ? '↑' : '↓'} {trend}
        </div>
      )}
    </motion.div>
  )
}
