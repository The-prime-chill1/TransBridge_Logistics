import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Target, Eye, Heart, ArrowRight, CheckCircle2,
  ShieldCheck, Zap, Users, Globe2
} from 'lucide-react'
import styles from './About.module.css'

const VALUES = [
  { icon: ShieldCheck, label: 'Integrity' },
  { icon: Zap, label: 'Reliability' },
  { icon: Eye, label: 'Transparency' },
  { icon: Heart, label: 'Customer Satisfaction' },
  { icon: Globe2, label: 'Innovation' },
  { icon: Users, label: 'Professionalism' },
  { icon: CheckCircle2, label: 'Accountability' },
  { icon: ShieldCheck, label: 'Security' },
  { icon: Zap, label: 'Excellence' },
]

const PROCESS = [
  'Request a Shipping Quote',
  'Schedule Pickup or Drop Off',
  'Package Inspection & Documentation',
  'Secure Packaging & Processing',
  'International Transportation',
  'Customs Clearance',
  'Local Distribution',
  'Final Doorstep Delivery',
]

const fadeUp = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } }

export default function About() {
  useEffect(() => { document.title = 'About Us — TransBridge Logistics' }, [])

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className='container'>
          <motion.div className={styles.heroContent} {...fadeUp}>
            <span className='section-eyebrow'>About TransBridge</span>
            <h1 className={styles.heroTitle}>
              Bridging the Distance Between the<br />
              <span className='text-gradient-gold'>UK and Nigeria</span>
            </h1>
            <p className={styles.heroText}>
              TransBridge Logistics is an international logistics and freight forwarding company
              providing secure, reliable, and efficient shipping solutions between the United Kingdom
              and Nigeria. We specialize in connecting individuals, families, and businesses through
              dependable door-to-door delivery services.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className={`section-padding ${styles.mvSection}`}>
        <div className='container'>
          <div className={styles.mvGrid}>
            <motion.div className={styles.mvCard} {...fadeUp}>
              <div className={styles.mvIcon}><Target size={26} /></div>
              <h2 className={styles.mvTitle}>Our Mission</h2>
              <p className={styles.mvText}>
                To provide dependable, affordable, and technology-driven logistics solutions that
                connect the United Kingdom and Nigeria while delivering every shipment safely,
                securely, and on time.
              </p>
            </motion.div>
            <motion.div className={styles.mvCard} {...fadeUp} transition={{ duration: 0.6, delay: 0.1 }}>
              <div className={styles.mvIcon}><Eye size={26} /></div>
              <h2 className={styles.mvTitle}>Our Vision</h2>
              <p className={styles.mvText}>
                To become one of the most trusted international logistics companies connecting
                Africa and the United Kingdom through innovation, transparency, and world-class
                customer service.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className={`section-padding ${styles.valuesSection}`}>
        <div className='container'>
          <motion.div {...fadeUp} style={{ marginBottom: 48 }}>
            <span className='section-eyebrow'>What We Stand For</span>
            <h2 className='section-title'>Our Core <span className='text-gradient-gold'>Values</span></h2>
          </motion.div>
          <div className={styles.valuesGrid}>
            {VALUES.map(({ icon: Icon, label }, i) => (
              <motion.div
                key={label}
                className={styles.valueCard}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <div className={styles.valueIcon}><Icon size={22} /></div>
                <span className={styles.valueLabel}>{label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Shipping Process */}
      <section className={`section-padding ${styles.processSection}`}>
        <div className='container'>
          <motion.div {...fadeUp} style={{ marginBottom: 52 }}>
            <span className='section-eyebrow'>How It Works</span>
            <h2 className='section-title'>Our <span className='text-gradient-gold'>Shipping Process</span></h2>
            <p className='section-subtitle' style={{ marginTop: 12 }}>
              From quote to doorstep — a seamless, transparent journey for every shipment.
            </p>
          </motion.div>
          <div className={styles.processGrid}>
            {PROCESS.map((step, i) => (
              <motion.div
                key={step}
                className={styles.processStep}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
              >
                <div className={styles.processNum}>{String(i + 1).padStart(2, '0')}</div>
                <div className={styles.processLabel}>{step}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className={styles.statsBanner}>
        <div className='container'>
          <div className={styles.statsGrid}>
            {[
              { num: '5,000+', lbl: 'Shipments Delivered' },
              { num: '98.7%', lbl: 'On-Time Rate' },
              { num: '2,400+', lbl: 'Happy Customers' },
              { num: '2', lbl: 'Countries Connected' },
            ].map(s => (
              <motion.div key={s.lbl} className={styles.statItem} {...fadeUp}>
                <span className={styles.statNum}>{s.num}</span>
                <span className={styles.statLbl}>{s.lbl}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={`section-padding ${styles.ctaSection}`}>
        <div className='container' style={{ textAlign: 'center' }}>
          <motion.div {...fadeUp}>
            <h2 className='section-title' style={{ marginBottom: 16 }}>Ready to Ship with Us?</h2>
            <p className='section-subtitle' style={{ margin: '0 auto 28px' }}>
              Experience the TransBridge difference — professional, reliable, transparent.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to='/get-quote' className='btn btn-primary btn-lg'>Get a Free Quote <ArrowRight size={17} /></Link>
              <Link to='/contact' className='btn btn-secondary btn-lg'>Contact Us</Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
