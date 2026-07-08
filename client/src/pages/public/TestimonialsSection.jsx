import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import styles from './TestimonialsSection.module.css'

const TESTIMONIALS = [
  { initials: 'AO', color: 'green', name: 'Adaeze Okonkwo', loc: 'Lagos, Nigeria', quote: 'TransBridge delivered my goods from London to Lagos in just 8 days. The tracking was perfect, I knew where my package was every single step.' },
  { initials: 'EM', color: 'gold', name: 'Emmanuel Mensah', loc: 'Abuja, Nigeria', quote: 'I use TransBridge for all my business imports from the UK. Their customs clearance service is outstanding and the team is always responsive.' },
  { initials: 'CI', color: 'navy', name: 'Chioma Ike', loc: 'Birmingham, UK', quote: 'Sent a large package from Birmingham to my family in Port Harcourt. Everything arrived safely and the SMS updates kept us all informed throughout.' },
]

export default function TestimonialsSection() {
  return (
    <section className={`section-padding ${styles.section}`}>
      <div className='container'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className='section-eyebrow'>Customer Reviews</span>
          <h2 className='section-title'>What Our <span className='text-gradient-gold'>Customers Say</span></h2>
        </motion.div>

        <div className={styles.grid}>
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              className={styles.card}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className={styles.stars}>
                {Array.from({ length: 5 }).map((_, j) => <Star key={j} size={14} fill='currentColor' />)}
              </div>
              <p className={styles.quote}>"{t.quote}"</p>
              <div className={styles.author}>
                <div className={`${styles.avatar} ${styles[t.color]}`}>{t.initials}</div>
                <div>
                  <div className={styles.name}>{t.name}</div>
                  <div className={styles.loc}>{t.loc}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
