import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { CheckCircle2, ArrowRight, MessageCircle } from 'lucide-react'
import styles from './Pricing.module.css'

const PLANS = [
  {
    name: 'Sea Freight',
    price: 'From £85',
    period: 'per shipment',
    desc: 'Cost-effective ocean freight for large or non-urgent shipments.',
    features: [
      '14–21 business day delivery',
      'Up to 50 kg included',
      'Customs clearance',
      'SMS & email tracking',
      'Door-to-door available',
    ],
    cta: 'Get a Quote',
    highlighted: false,
  },
  {
    name: 'Air Freight',
    price: 'From £145',
    period: 'per shipment',
    desc: 'Fast and reliable air cargo for urgent deliveries. Most popular.',
    features: [
      '5–8 business day delivery',
      'Up to 20 kg included',
      'Priority customs clearance',
      'Real-time tracking',
      'Door-to-door delivery',
      'Photo proof of delivery',
    ],
    cta: 'Get Started',
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    name: 'Commercial Cargo',
    price: 'Custom',
    period: 'quoted per order',
    desc: 'Tailored solutions for businesses shipping at volume.',
    features: [
      'Flexible delivery schedule',
      'Bulk & pallet shipments',
      'Dedicated account manager',
      'Priority support',
      'Consolidated billing',
    ],
    cta: 'Contact Us',
    highlighted: false,
  },
]

const FAQS = [
  { q: 'How is the shipping price calculated?', a: 'Pricing is based on weight, dimensions, service type (air or sea), and the destination within Nigeria. Get a quote online for an instant estimate.' },
  { q: 'Are customs duties included?', a: 'Import duties and taxes levied by Nigerian customs are the responsibility of the receiver. Our team will guide you through any applicable charges.' },
  { q: 'Do you offer insurance?', a: 'Basic coverage is included with every shipment. Additional cargo insurance is available upon request — contact us for details.' },
  { q: 'Can I send multiple packages?', a: 'Yes. Our consolidation service lets you combine multiple packages into one shipment to reduce costs significantly.' },
]

export default function Pricing() {
  useEffect(() => { document.title = 'Pricing — TransBridge Logistics' }, [])

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className='container'>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ textAlign: 'center' }}>
            <span className='section-eyebrow'>Transparent Pricing</span>
            <h1 className={styles.heroTitle}>Simple, Honest <span className='text-gradient-gold'>Shipping Rates</span></h1>
            <p className={styles.heroText}>No hidden fees. No surprises. Just clear, competitive pricing for UK–Nigeria shipping.</p>
          </motion.div>
        </div>
      </section>

      <section className='section-padding'>
        <div className='container'>
          <div className={styles.plansGrid}>
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.name}
                className={`${styles.planCard} ${plan.highlighted ? styles.highlighted : ''}`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                {plan.badge && <span className={styles.planBadge}>{plan.badge}</span>}
                <h3 className={styles.planName}>{plan.name}</h3>
                <p className={styles.planDesc}>{plan.desc}</p>
                <div className={styles.planPrice}>
                  <span className={styles.planPriceNum}>{plan.price}</span>
                  <span className={styles.planPricePer}>{plan.period}</span>
                </div>
                <ul className={styles.planFeatures}>
                  {plan.features.map(f => (
                    <li key={f} className={styles.planFeature}>
                      <CheckCircle2 size={15} className={styles.planCheck} /> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to={plan.name === 'Commercial Cargo' ? '/contact' : '/get-quote'}
                  className={`btn btn-lg ${plan.highlighted ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ width: '100%', justifyContent: 'center', marginTop: 'auto' }}
                >
                  {plan.cta} <ArrowRight size={16} />
                </Link>
              </motion.div>
            ))}
          </div>

          {/* FAQ */}
          <motion.div
            className={styles.faqSection}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className='section-title' style={{ marginBottom: 32 }}>Pricing <span className='text-gradient-gold'>FAQs</span></h2>
            <div className={styles.faqGrid}>
              {FAQS.map(f => (
                <div key={f.q} className={styles.faqItem}>
                  <h4 className={styles.faqQ}>{f.q}</h4>
                  <p className={styles.faqA}>{f.a}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <div className={styles.customCTA}>
            <MessageCircle size={24} className={styles.customCTAIcon} />
            <div>
              <h4 className={styles.customCTATitle}>Need a custom quote for your specific shipment?</h4>
              <p className={styles.customCTAText}>Tell us about your package and we'll give you an exact price within 24 hours.</p>
            </div>
            <Link to='/get-quote' className='btn btn-primary'>Get Custom Quote <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>
    </div>
  )
}
