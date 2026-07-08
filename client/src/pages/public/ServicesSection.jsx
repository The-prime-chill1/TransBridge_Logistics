import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Plane, Ship, Truck, Globe2, ShieldCheck,
  Package2, Warehouse, Boxes, ArrowUpRight
} from 'lucide-react'
import styles from './ServicesSection.module.css'

const SERVICES = [
  { icon: Plane, title: 'Air Freight', desc: 'Fast, secure air cargo for urgent shipments with full tracking and customs clearance.' },
  { icon: Ship, title: 'Sea Freight', desc: 'Cost-effective ocean freight for bulk cargo, household goods, and commercial inventory.' },
  { icon: Truck, title: 'Door-to-Door Delivery', desc: "Complete end-to-end service from pickup at your location to recipient's doorstep." },
  { icon: Globe2, title: 'Import & Export', desc: 'Professional logistics solutions for businesses and individuals importing or exporting goods.' },
  { icon: ShieldCheck, title: 'Customs Clearance', desc: 'Expert documentation and clearance handling for smooth cross-border shipping.' },
  { icon: Package2, title: 'Commercial Cargo', desc: 'Reliable freight services for businesses transporting products internationally at scale.' },
  { icon: Warehouse, title: 'Warehousing & Storage', desc: 'Secure storage facilities for goods awaiting shipment or final delivery.' },
  { icon: Boxes, title: 'Package Consolidation', desc: 'Combine multiple shipments into one package to reduce costs and improve efficiency.' },
]

export default function ServicesSection() {
  return (
    <section className={`section-padding ${styles.section}`}>
      <div className='container'>
        <div className={styles.header}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className='section-eyebrow'>What We Offer</span>
            <h2 className='section-title'>Our <span className='text-gradient-gold'>Services</span></h2>
            <p className='section-subtitle' style={{ marginTop: 12 }}>
              Comprehensive logistics solutions tailored for the UK–Nigeria shipping corridor.
            </p>
          </motion.div>
          <Link to='/services' className='btn btn-ghost'>
            View All Services <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className={styles.grid}>
          {SERVICES.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              className={styles.card}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
              whileHover={{ y: -6 }}
            >
              <div className={styles.iconWrap}><Icon size={24} /></div>
              <h3 className={styles.cardTitle}>{title}</h3>
              <p className={styles.cardDesc}>{desc}</p>
              <span className={styles.cardArrow}><ArrowUpRight size={16} /></span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
