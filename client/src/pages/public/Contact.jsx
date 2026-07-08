import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { MessageCircle, Mail, Phone, Clock, CheckCircle2, ArrowRight } from 'lucide-react'
import api from '../../services/api'
import styles from './Contact.module.css'

export default function Contact() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => { document.title = 'Contact Us — TransBridge Logistics' }, [])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      // Re-uses the quotes endpoint as a general enquiry
      await api.post('/quotes', { ...data, serviceType: data.serviceType || 'General Inquiry', origin: 'N/A', destination: 'N/A' })
      setSubmitted(true)
      reset()
    } catch {
      toast.error('Failed to send message. Please try WhatsApp or email directly.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className='container'>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className='section-eyebrow' style={{ color: 'var(--color-gold)' }}>Get in Touch</span>
            <h1 className={styles.heroTitle}>We're Here to <span className='text-gradient-gold'>Help</span></h1>
            <p className={styles.heroText}>Whether you're ready to ship or just have questions, our team in the UK and Nigeria is ready to assist.</p>
          </motion.div>
        </div>
      </section>

      <section className='section-padding'>
        <div className='container'>
          <div className={styles.layout}>
            <div className={styles.infoCol}>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
                <h2 className={styles.infoTitle}>Contact Information</h2>
                <p className={styles.infoText}>Reach us through any of the channels below. WhatsApp is the fastest way to get a response.</p>
                <div className={styles.contactCards}>
                  <a href='https://wa.me/447934219309' target='_blank' rel='noopener noreferrer' className={styles.contactCard}>
                    <div className={`${styles.contactIcon} ${styles.green}`}><MessageCircle size={20} /></div>
                    <div>
                      <span className={styles.contactLabel}>UK WhatsApp</span>
                      <span className={styles.contactValue}>+44 7934 219309</span>
                    </div>
                  </a>
                  <a href='https://wa.me/2348165595873' target='_blank' rel='noopener noreferrer' className={styles.contactCard}>
                    <div className={`${styles.contactIcon} ${styles.green}`}><MessageCircle size={20} /></div>
                    <div>
                      <span className={styles.contactLabel}>Nigeria WhatsApp</span>
                      <span className={styles.contactValue}>08165595873</span>
                    </div>
                  </a>
                  <a href='mailto:Transbridgelogistics01@gmail.com' className={styles.contactCard}>
                    <div className={`${styles.contactIcon} ${styles.gold}`}><Mail size={20} /></div>
                    <div>
                      <span className={styles.contactLabel}>Email</span>
                      <span className={styles.contactValue}>Transbridgelogistics01@gmail.com</span>
                    </div>
                  </a>
                  <div className={styles.contactCard}>
                    <div className={`${styles.contactIcon} ${styles.navy}`}><Clock size={20} /></div>
                    <div>
                      <span className={styles.contactLabel}>Response Time</span>
                      <span className={styles.contactValue}>Within 24 hours (Mon–Sat)</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div
              className={styles.formCard}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {submitted ? (
                <div className={styles.successState}>
                  <div className={styles.successIcon}><CheckCircle2 size={32} /></div>
                  <h3>Message Sent!</h3>
                  <p>We'll get back to you within 24 hours. For urgent matters please contact us via WhatsApp.</p>
                  <button className='btn btn-primary' onClick={() => setSubmitted(false)}>Send Another <ArrowRight size={15} /></button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                  <h3 className={styles.formTitle}>Send a Message</h3>
                  <div className={styles.row2}>
                    <div className='form-group'>
                      <label className='form-label'>Full Name</label>
                      <input className={`form-input ${errors.fullName ? 'error' : ''}`} placeholder='John Okafor' {...register('fullName', { required: 'Required' })} />
                    </div>
                    <div className='form-group'>
                      <label className='form-label'>Phone</label>
                      <input className='form-input' placeholder='+44 7934...' {...register('phone', { required: 'Required' })} />
                    </div>
                  </div>
                  <div className='form-group' style={{ marginBottom: 14 }}>
                    <label className='form-label'>Email</label>
                    <input type='email' className={`form-input ${errors.email ? 'error' : ''}`} placeholder='john@example.com' {...register('email', { required: 'Required' })} />
                  </div>
                  <div className='form-group' style={{ marginBottom: 14 }}>
                    <label className='form-label'>Subject</label>
                    <select className='form-input' {...register('serviceType')}>
                      <option value='General Inquiry'>General Inquiry</option>
                      <option value='Air Freight'>Air Freight</option>
                      <option value='Sea Freight'>Sea Freight</option>
                      <option value='Customs Clearance'>Customs Clearance</option>
                      <option value='Commercial Cargo'>Commercial Cargo</option>
                    </select>
                  </div>
                  <div className='form-group' style={{ marginBottom: 22 }}>
                    <label className='form-label'>Message</label>
                    <textarea className='form-input' rows={5} placeholder='How can we help you?' {...register('description', { required: 'Required' })} />
                    {errors.description && <span className='form-error'>{errors.description.message}</span>}
                  </div>
                  <button type='submit' className='btn btn-primary' disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                    {loading ? <span className='loading-spinner' /> : <>Send Message <ArrowRight size={16} /></>}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
