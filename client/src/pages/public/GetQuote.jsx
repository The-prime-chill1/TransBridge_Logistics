import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { quoteAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import styles from './GetQuote.module.css'

const SERVICES = ['Air Freight','Sea Freight','Door-to-Door Delivery','Import & Export','Customs Clearance','Commercial Cargo','Warehousing','Package Consolidation']

export default function GetQuote() {
  const { user } = useAuth()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      fullName: user ? `${user.firstName} ${user.lastName}` : '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  })

  useEffect(() => { document.title = 'Get a Quote — TransBridge Logistics' }, [])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await quoteAPI.create(data)
      setSubmitted(true)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit quote request')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className={styles.page}>
        <div className={styles.hero} />
        <div className='container'>
          <motion.div className={styles.successBox} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className={styles.successIcon}><CheckCircle2 size={36} /></div>
            <h2 className={styles.successTitle}>Quote Request Received!</h2>
            <p className={styles.successText}>Thank you for your request. Our team will review your shipment details and respond within 24 hours via email and phone.</p>
            <button className='btn btn-primary btn-lg' onClick={() => setSubmitted(false)}>Submit Another Request <ArrowRight size={17} /></button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className='container'>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className='section-eyebrow' style={{ color: 'var(--color-gold)' }}>Free Estimate</span>
            <h1 className={styles.heroTitle}>Get a Shipping <span className='text-gradient-gold'>Quote</span></h1>
            <p className={styles.heroText}>Fill in your shipment details and we'll get back to you with a competitive price within 24 hours.</p>
          </motion.div>
        </div>
      </section>

      <section className='section-padding'>
        <div className='container'>
          <div className={styles.layout}>
            <motion.div
              className={styles.formCard}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Your Details</h3>
                  <div className={styles.row2}>
                    <div className='form-group'>
                      <label className='form-label'>Full Name</label>
                      <input className={`form-input ${errors.fullName ? 'error' : ''}`} placeholder='John Okafor' {...register('fullName', { required: 'Required' })} />
                      {errors.fullName && <span className='form-error'>{errors.fullName.message}</span>}
                    </div>
                    <div className='form-group'>
                      <label className='form-label'>Phone Number</label>
                      <input className={`form-input ${errors.phone ? 'error' : ''}`} placeholder='+44 7934 219309' {...register('phone', { required: 'Required' })} />
                      {errors.phone && <span className='form-error'>{errors.phone.message}</span>}
                    </div>
                  </div>
                  <div className='form-group'>
                    <label className='form-label'>Email Address</label>
                    <input type='email' className={`form-input ${errors.email ? 'error' : ''}`} placeholder='john@example.com' {...register('email', { required: 'Required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })} />
                    {errors.email && <span className='form-error'>{errors.email.message}</span>}
                  </div>
                </div>

                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Shipment Details</h3>
                  <div className='form-group' style={{ marginBottom: 14 }}>
                    <label className='form-label'>Service Type</label>
                    <select className={`form-input ${errors.serviceType ? 'error' : ''}`} {...register('serviceType', { required: 'Required' })}>
                      <option value=''>Select a service...</option>
                      {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.serviceType && <span className='form-error'>{errors.serviceType.message}</span>}
                  </div>
                  <div className={styles.row2}>
                    <div className='form-group'>
                      <label className='form-label'>Origin</label>
                      <input className={`form-input ${errors.origin ? 'error' : ''}`} placeholder='London, UK' {...register('origin', { required: 'Required' })} />
                    </div>
                    <div className='form-group'>
                      <label className='form-label'>Destination</label>
                      <input className={`form-input ${errors.destination ? 'error' : ''}`} placeholder='Lagos, Nigeria' {...register('destination', { required: 'Required' })} />
                    </div>
                  </div>
                  <div className={styles.row2}>
                    <div className='form-group'>
                      <label className='form-label'>Approximate Weight (kg)</label>
                      <input type='number' step='0.1' className='form-input' placeholder='5.0' {...register('weight')} />
                    </div>
                    <div className='form-group'>
                      <label className='form-label'>Package Type</label>
                      <select className='form-input' {...register('packageType')}>
                        <option value=''>Select...</option>
                        <option>Document</option><option>Parcel</option><option>Pallet</option>
                        <option>Container</option><option>Personal Effects</option><option>Commercial Goods</option>
                      </select>
                    </div>
                  </div>
                  <div className='form-group'>
                    <label className='form-label'>Additional Details</label>
                    <textarea className='form-input' rows={4} placeholder='Describe your shipment, any special requirements, or questions...' {...register('description')} />
                  </div>
                </div>

                <button type='submit' className='btn btn-primary btn-lg' disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                  {loading ? <span className='loading-spinner' /> : <>Submit Quote Request <ArrowRight size={17} /></>}
                </button>
              </form>
            </motion.div>

            <motion.div
              className={styles.sidebar}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className={styles.sideCard}>
                <h3 className={styles.sideTitle}>What Happens Next?</h3>
                <div className={styles.steps}>
                  {['Submit your quote request','Our team reviews your shipment details','We contact you within 24 hours','You confirm and we arrange pickup'].map((s, i) => (
                    <div key={s} className={styles.step}>
                      <div className={styles.stepNum}>{i + 1}</div>
                      <p className={styles.stepText}>{s}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.sideCard}>
                <h3 className={styles.sideTitle}>Contact Us Directly</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <a href='https://wa.me/447934219309' target='_blank' rel='noopener noreferrer' className={styles.contactLink}>📱 UK: +44 7934 219309</a>
                  <a href='https://wa.me/2348165595873' target='_blank' rel='noopener noreferrer' className={styles.contactLink}>📱 Nigeria: 08165595873</a>
                  <a href='mailto:Transbridgelogistics01@gmail.com' className={styles.contactLink}>✉️ Transbridgelogistics01@gmail.com</a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
