import { Link } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Package, ArrowRight, Plane, Ship, Truck, HelpCircle, FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import GlassIcons from '../../components/ui/GlassIcons'
import styles from './Hero.module.css'

export default function Hero() {
  const [trackingInput, setTrackingInput] = useState('')
  const navigate = useNavigate()

  const handleTrack = (e) => {
    e.preventDefault()
    if (trackingInput.trim()) {
      navigate(`/track/${trackingInput.trim()}`)
    } else {
      navigate('/track')
    }
  }

  const glassItems = [
    { icon: <Plane size={22} />, color: 'blue', label: 'Air Freight' },
    { icon: <Ship size={22} />, color: 'cyan', label: 'Sea Freight' },
    { icon: <Truck size={22} />, color: 'green', label: 'Land Cargo' },
    { icon: <FileText size={22} />, color: 'gold', label: 'Get Quote' },
    { icon: <HelpCircle size={22} />, color: 'purple', label: 'Support' },
  ]

  return (
    <section className={styles.hero}>
      <div className={styles.bgGradient} />
      <div className={styles.particles}>
        {Array.from({ length: 20 }).map((_, i) => (
          <span key={i} className={styles.particle} style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${8 + Math.random() * 6}s`,
          }} />
        ))}
      </div>

      <div className='container'>
        <div className={styles.content}>
          <motion.div
            className={styles.badge}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className={styles.badgeDot} />
            UK ⇄ Nigeria Route Active
          </motion.div>

          <motion.h1
            className={styles.title}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <span className={styles.titleLine1}>Across Borders,</span>
            <span className={styles.titleLine2}>On Time.</span>
          </motion.h1>

          <motion.p
            className={styles.subtitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Reliable <strong>door-to-door shipping</strong> between the United Kingdom and Nigeria.
            Fast, secure, and fully tracked logistics for individuals and businesses.
          </motion.p>

          <motion.div
            className={styles.actions}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <Link to='/get-quote' className='btn btn-primary btn-lg'>
              Get a Quote <ArrowRight size={18} />
            </Link>
            <Link to='/track' className='btn btn-secondary btn-lg'>
              <Package size={18} /> Track Shipment
            </Link>
          </motion.div>

          <motion.form
            className={styles.trackBar}
            onSubmit={handleTrack}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <Package size={18} className={styles.trackIcon} />
            <input
              type='text'
              placeholder='Enter tracking number e.g. TB-2026-000123'
              value={trackingInput}
              onChange={e => setTrackingInput(e.target.value)}
            />
            <button type='submit' className='btn btn-primary btn-sm'>Track</button>
          </motion.form>

          {/* Integrated GlassIcons for interactive features quick navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            style={{ margin: '32px 0 48px 0', overflow: 'visible' }}
          >
            <GlassIcons items={glassItems} />
          </motion.div>

          <motion.div
            className={styles.stats}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            <div className={styles.stat}>
              <span className={styles.statNum}>5,000+</span>
              <span className={styles.statLabel}>Shipments Delivered</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>98.7%</span>
              <span className={styles.statLabel}>On-Time Rate</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>2,400+</span>
              <span className={styles.statLabel}>Happy Customers</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
