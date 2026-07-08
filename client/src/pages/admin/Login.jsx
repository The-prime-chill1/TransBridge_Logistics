import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import styles from '../public/Auth.module.css'

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const user = await login({ identifier: data.identifier, password: data.password })
      if (user.role !== 'admin' && user.role !== 'staff') {
        toast.error('This portal is for administrators only')
        return
      }
      toast.success(`Welcome back, ${user.firstName}`)
      navigate('/admin')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
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

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(0,135,81,0.1)', border: '1px solid rgba(0,135,81,0.25)', padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, color: 'var(--color-green)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 20 }}>
            <ShieldCheck size={13} /> Admin Portal
          </div>

          <h1 className={styles.title}>Administrator Sign In</h1>
          <p className={styles.subtitle}>Secure access to the TransBridge control center.</p>

          <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className='form-group'>
              <label className='form-label'>Email Address</label>
              <div className={styles.inputIconWrap}>
                <Mail size={16} className={styles.inputIcon} />
                <input
                  className={`form-input ${errors.identifier ? 'error' : ''}`}
                  placeholder='admin@transbridgelogistics.com'
                  {...register('identifier', { required: 'Email is required' })}
                />
              </div>
              {errors.identifier && <span className='form-error'>{errors.identifier.message}</span>}
            </div>

            <div className='form-group'>
              <label className='form-label'>Password</label>
              <div className={styles.inputIconWrap}>
                <Lock size={16} className={styles.inputIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder='Enter your password'
                  {...register('password', { required: 'Password is required' })}
                />
                <button type='button' className={styles.passwordToggle} onClick={() => setShowPassword(v => !v)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span className='form-error'>{errors.password.message}</span>}
            </div>

            <button type='submit' className='btn btn-navy btn-lg' disabled={loading} style={{ justifyContent: 'center', marginTop: 8 }}>
              {loading ? <span className='loading-spinner' /> : <>Sign In to Dashboard <ArrowRight size={18} /></>}
            </button>
          </form>

          <p className={styles.footer}>
            Not an administrator? <Link to='/login' className={styles.footerLink}>Customer Login</Link>
          </p>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.rightContent}>
          <span className={styles.rightBadge}>Restricted Access</span>
          <h2 className={styles.rightTitle}>Manage Every Shipment, Customer & Insight.</h2>
          <p className={styles.rightText}>
            The TransBridge admin portal gives your team full control over shipment management, customer accounts, analytics, and support — all in real time.
          </p>
        </div>
      </div>
    </div>
  )
}
