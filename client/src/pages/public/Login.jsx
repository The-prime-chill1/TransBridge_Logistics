import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Package, Clock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import styles from './Auth.module.css'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const user = await login({ identifier: data.identifier, password: data.password })
      toast.success(`Welcome back, ${user.firstName}!`)
      navigate(user.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed'
      if (err.response?.status === 403) {
        toast.error('Please verify your account first')
        navigate('/verify-otp', { state: { identifier: data.identifier, type: 'registration' } })
      } else {
        toast.error(msg)
      }
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

          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>Sign in to track shipments and manage your account.</p>

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

            <Link to='/forgot-password' className={styles.forgotLink}>Forgot Password?</Link>

            <button type='submit' className='btn btn-primary btn-lg' disabled={loading} style={{ justifyContent: 'center', marginTop: 8 }}>
              {loading ? <span className='loading-spinner' /> : <>Sign In <ArrowRight size={18} /></>}
            </button>
          </form>

          <p className={styles.footer}>
            Don't have an account? <Link to='/register' className={styles.footerLink}>Create one</Link>
          </p>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.rightContent}>
          <span className={styles.rightBadge}>Across Borders, On Time.</span>
          <h2 className={styles.rightTitle}>Track Every Shipment, Anytime.</h2>
          <p className={styles.rightText}>
            Access your dashboard to view shipment history, track packages live, and manage your account securely.
          </p>
          <div className={styles.rightStats}>
            <div className={styles.rightStat}>
              <span className={styles.rightStatNum}>5,000+</span>
              <span className={styles.rightStatLabel}>Shipments</span>
            </div>
            <div className={styles.rightStat}>
              <span className={styles.rightStatNum}>98.7%</span>
              <span className={styles.rightStatLabel}>On-Time</span>
            </div>
            <div className={styles.rightStat}>
              <span className={styles.rightStatNum}>2,400+</span>
              <span className={styles.rightStatLabel}>Customers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
