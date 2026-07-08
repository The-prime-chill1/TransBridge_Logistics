import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Mail, ArrowRight, KeyRound } from 'lucide-react'
import { authAPI } from '../../services/api'
import styles from './Auth.module.css'

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await authAPI.forgotPassword({ identifier: data.identifier })
      toast.success('Reset code sent to your email and phone')
      navigate('/verify-otp', { state: { identifier: data.identifier, type: 'password-reset' } })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.left}>
        <div className={styles.formBox}>
          <Link to='/' className={styles.logo}>
            <div className={styles.logoMark}>TB</div>
            <span className={styles.logoText}>TRANS<span className={styles.logoAccent}>BRIDGE</span></span>
          </Link>

          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(212,160,23,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <KeyRound size={26} color='var(--color-gold-dark)' />
          </div>

          <h1 className={styles.title}>Forgot Password?</h1>
          <p className={styles.subtitle}>
            Enter your email or phone number and we'll send a verification code to reset your password.
          </p>

          <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className='form-group'>
              <label className='form-label'>Email or Phone Number</label>
              <div className={styles.inputIconWrap}>
                <Mail size={16} className={styles.inputIcon} />
                <input
                  className={`form-input ${errors.identifier ? 'error' : ''}`}
                  placeholder='john@example.com or +44 7934 219309'
                  {...register('identifier', { required: 'This field is required' })}
                />
              </div>
              {errors.identifier && <span className='form-error'>{errors.identifier.message}</span>}
            </div>

            <button type='submit' className='btn btn-primary btn-lg' disabled={loading} style={{ justifyContent: 'center', marginTop: 8 }}>
              {loading ? <span className='loading-spinner' /> : <>Send Reset Code <ArrowRight size={18} /></>}
            </button>
          </form>

          <p className={styles.footer}>
            Remember your password? <Link to='/login' className={styles.footerLink}>Sign In</Link>
          </p>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.rightContent}>
          <span className={styles.rightBadge}>Account Recovery</span>
          <h2 className={styles.rightTitle}>Secure Password Reset</h2>
          <p className={styles.rightText}>
            We'll send a 5-digit verification code to both your email and phone to confirm it's really you before resetting your password.
          </p>
        </div>
      </div>
    </div>
  )
}
