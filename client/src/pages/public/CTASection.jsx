import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, MessageCircle } from 'lucide-react'
import styles from './CTASection.module.css'

export default function CTASection() {
  return (
    <section className={styles.section}>
      <div className='container'>
        <motion.div
          className={styles.box}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className={styles.glow} />
          <h2 className={styles.title}>Ready to Ship with TransBridge?</h2>
          <p className={styles.subtitle}>
            Join thousands of satisfied customers shipping between the UK and Nigeria. Get a free quote today.
          </p>
          <div className={styles.actions}>
            <Link to='/get-quote' className='btn btn-primary btn-lg'>
              Get a Free Quote <ArrowRight size={18} />
            </Link>
            <a href='https://wa.me/447934219309' target='_blank' rel='noopener noreferrer' className='btn btn-secondary btn-lg'>
              <MessageCircle size={18} /> Chat on WhatsApp
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
