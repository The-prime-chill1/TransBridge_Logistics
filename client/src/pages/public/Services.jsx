import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Plane, Ship, Truck, Globe2, ShieldCheck, Package2,
  Warehouse, Boxes, CheckCircle2, ArrowRight
} from 'lucide-react'
import styles from './Services.module.css'

const SERVICES = [
  {
    icon: Plane, title: 'Air Freight',
    desc: 'Fast and secure air cargo services for urgent shipments between the UK and Nigeria. Ideal for time-sensitive goods.',
    features: ['5–8 business day delivery', 'Full tracking included', 'Customs clearance handled', 'Suitable for documents & parcels'],
    badge: 'Most Popular',
  },
  {
    icon: Ship, title: 'Sea Freight',
    desc: 'Affordable ocean freight solutions for commercial cargo, household goods, and large shipments at competitive rates.',
    features: ['14–21 business day delivery', 'Cost-effective for large cargo', 'LCL & FCL options', 'Commercial and household goods'],
  },
  {
    icon: Truck, title: 'Door-to-Door Delivery',
    desc: 'Convenient pickup from the sender\'s location and delivery directly to the recipient\'s doorstep — no hassle.',
    features: ['Pickup anywhere in the UK', 'Delivery anywhere in Nigeria', 'Real-time tracking', 'Signature confirmation'],
    badge: 'Full Service',
  },
  {
    icon: Globe2, title: 'Import & Export',
    desc: 'Professional logistics for businesses and individuals importing or exporting goods across the UK-Nigeria corridor.',
    features: ['Business & personal imports', 'Export documentation', 'Regulatory compliance', 'Competitive freight rates'],
  },
  {
    icon: ShieldCheck, title: 'Customs Clearance',
    desc: 'Expert customs documentation and clearance to ensure smooth cross-border shipping with no unexpected delays.',
    features: ['Full documentation handling', 'HMRC & NCS compliance', 'Duty & tax calculation', 'Fast clearance turnaround'],
  },
  {
    icon: Package2, title: 'Commercial Cargo',
    desc: 'Reliable freight services for businesses transporting products, inventory, or equipment internationally at scale.',
    features: ['Bulk & pallet shipments', 'B2B logistics solutions', 'Flexible pickup scheduling', 'Dedicated account support'],
  },
  {
    icon: Warehouse, title: 'Warehousing & Storage',
    desc: 'Secure storage facilities for goods awaiting shipment or delivery, with inventory management support.',
    features: ['Secure UK & Nigeria facilities', 'Short & long-term storage', 'Inventory management', 'Pick-and-pack services'],
  },
  {
    icon: Boxes, title: 'Package Consolidation',
    desc: 'Combine multiple shipments from different suppliers into one package to reduce costs and improve efficiency.',
    features: ['Save on shipping costs', 'Combine multiple orders', 'Flexible collection window', 'Single tracking number'],
  },
]

export default function Services() {
  useEffect(() => { document.title = 'Our Services — TransBridge Logistics' }, [])

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className='container'>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className='section-eyebrow' style={{ color: 'var(--color-gold)' }}>What We Offer</span>
            <h1 className={styles.heroTitle}>Comprehensive UK–Nigeria <span className='text-gradient-gold'>Logistics</span></h1>
            <p className={styles.heroText}>
              From urgent air freight to sea cargo consolidation — every service you need to move goods safely between the UK and Nigeria.
            </p>
          </motion.div>
        </div>
      </section>

      <section className='section-padding'>
        <div className='container'>
          <div className={styles.grid}>
            {SERVICES.map(({ icon: Icon, title, desc, features, badge }, i) => (
              <motion.div
                key={title}
                className={styles.card}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (i % 2) * 0.1 }}
              >
                {badge && <span className={styles.badge}>{badge}</span>}
                <div className={styles.cardIcon}><Icon size={26} /></div>
                <h2 className={styles.cardTitle}>{title}</h2>
                <p className={styles.cardDesc}>{desc}</p>
                <ul className={styles.featureList}>
                  {features.map(f => (
                    <li key={f} className={styles.featureItem}>
                      <CheckCircle2 size={14} className={styles.featureCheck} /> {f}
                    </li>
                  ))}
                </ul>
                <Link to='/get-quote' className={styles.cardCTA}>
                  Get a Quote <ArrowRight size={15} />
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div
            className={styles.ctaBanner}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <h3 className={styles.ctaBannerTitle}>Not sure which service you need?</h3>
              <p className={styles.ctaBannerText}>Our team will assess your shipment and recommend the most efficient and cost-effective solution.</p>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to='/contact' className='btn btn-secondary'>Contact Us</Link>
              <Link to='/get-quote' className='btn btn-primary'>Get a Quote <ArrowRight size={16} /></Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
