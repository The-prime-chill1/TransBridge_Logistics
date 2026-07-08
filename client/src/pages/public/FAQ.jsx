import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ChevronDown, MessageCircle } from 'lucide-react'
import styles from './FAQ.module.css'

const FAQS = [
  {
    category: 'Shipping & Delivery',
    items: [
      { q: 'How long does shipping from the UK to Nigeria take?', a: 'Air freight typically takes 5–8 business days, while sea freight takes 14–21 business days depending on destination and customs clearance time.' },
      { q: 'Do you offer door-to-door delivery in Nigeria?', a: 'Yes. We provide door-to-door delivery throughout Nigeria, including Lagos, Abuja, Port Harcourt, Kano, and other major cities.' },
      { q: 'What items can I ship?', a: 'We ship most personal and commercial goods including documents, electronics, clothing, food items, machinery parts, and household goods. Prohibited items include weapons, illegal substances, and perishables without prior arrangement.' },
      { q: 'What is the minimum weight for a shipment?', a: 'There is no strict minimum weight, but our standard pricing starts from 0.5 kg. For very small items, package consolidation may be the most cost-effective option.' },
    ],
  },
  {
    category: 'Tracking',
    items: [
      { q: 'How do I track my shipment?', a: 'Visit our Track Shipment page and enter your unique tracking number (format: TB-2026-XXXXXX). You will see the full status and timeline of your shipment in real time.' },
      { q: 'How often is the tracking status updated?', a: 'Status updates happen at each key milestone — pickup, warehouse, departure, customs clearance, arrival, and delivery. You will also receive automatic SMS and email notifications.' },
      { q: 'What do I do if my tracking number is not working?', a: 'Please allow up to 24 hours after shipping for the tracking number to become active. If it still does not work, contact our support team via WhatsApp.' },
    ],
  },
  {
    category: 'Customs & Documentation',
    items: [
      { q: 'Do you handle customs clearance?', a: 'Yes. We handle all necessary customs documentation for both UK export and Nigeria import. Our team ensures compliance with HMRC and Nigerian Customs Service (NCS) requirements.' },
      { q: 'Are there any items restricted by Nigerian Customs?', a: 'Yes. Nigerian customs prohibits or restricts items including certain food products, used clothing (without permit), firearms, and counterfeit goods. We will advise you on any specific restrictions for your shipment.' },
      { q: 'Who pays import duties?', a: 'Import duties and taxes levied by Nigerian Customs are typically the responsibility of the receiver. TransBridge will guide you through the process to ensure no surprises.' },
    ],
  },
  {
    category: 'Account & Payments',
    items: [
      { q: 'Do I need to create an account to ship?', a: 'You can request a quote without an account, but creating a free account lets you track all shipments, view history, receive notifications, and save addresses.' },
      { q: 'What payment methods do you accept?', a: 'We accept bank transfers (UK and Nigeria), and will contact you directly to arrange payment after your quote is confirmed. Online payment integration is coming soon.' },
      { q: 'How secure is my account?', a: 'Very secure. We use bank-grade encryption, JWT authentication, and require OTP verification via both email and SMS for account actions including registration and password changes.' },
    ],
  },
]

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`${styles.item} ${open ? styles.itemOpen : ''}`}>
      <button className={styles.itemBtn} onClick={() => setOpen(v => !v)}>
        <span>{q}</span>
        <ChevronDown size={18} className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <p className={styles.answer}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQ() {
  useEffect(() => { document.title = 'FAQ — TransBridge Logistics' }, [])

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className='container'>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className='section-eyebrow' style={{ color: 'var(--color-gold)' }}>Help Centre</span>
            <h1 className={styles.heroTitle}>Frequently Asked <span className='text-gradient-gold'>Questions</span></h1>
            <p className={styles.heroText}>Everything you need to know about shipping with TransBridge.</p>
          </motion.div>
        </div>
      </section>

      <section className='section-padding'>
        <div className='container'>
          <div className={styles.layout}>
            <div className={styles.main}>
              {FAQS.map(({ category, items }, ci) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: ci * 0.1 }}
                  className={styles.category}
                >
                  <h2 className={styles.categoryTitle}>{category}</h2>
                  <div className={styles.itemsList}>
                    {items.map(item => <FAQItem key={item.q} {...item} />)}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className={styles.sidebar}>
              <div className={styles.sideCard}>
                <h3 className={styles.sideTitle}>Still have questions?</h3>
                <p className={styles.sideText}>Our team is available on WhatsApp for immediate answers.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                  <a href='https://wa.me/447934219309' target='_blank' rel='noopener noreferrer' className='btn btn-primary' style={{ justifyContent: 'center' }}>
                    <MessageCircle size={16} /> Chat UK
                  </a>
                  <a href='https://wa.me/2348165595873' target='_blank' rel='noopener noreferrer' className='btn btn-secondary' style={{ justifyContent: 'center' }}>
                    <MessageCircle size={16} /> Chat Nigeria
                  </a>
                </div>
              </div>
              <div className={styles.sideCard}>
                <h3 className={styles.sideTitle}>Ready to ship?</h3>
                <p className={styles.sideText}>Get a free quote for your shipment in minutes.</p>
                <Link to='/get-quote' className='btn btn-primary' style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}>Get a Quote</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
