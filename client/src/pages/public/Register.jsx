import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  User, Mail, Phone, Lock, Eye, EyeOff, Globe2,
  ShieldCheck, Package, Clock, ArrowRight
} from 'lucide-react'
import { authAPI } from '../../services/api'
import styles from './Auth.module.css'

const COUNTRIES = [
  { code: 'GB', name: 'United Kingdom', dial: '+44' },
  { code: 'NG', name: 'Nigeria', dial: '+234' },
]

export default function Register() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const password = watch('password')

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const res = await authAPI.register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: `${data.dialCode}${data.phone}`,
        country: data.country,
        password: data.password,
      })
      toast.success('Registration successful! Please verify your account.')
      navigate('/verify-otp', { state: { email: data.email, phone: `${data.dialCode}${data.phone}`, type: 'registration' } })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
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

          <h1 className={styles.title}>Create Your Account</h1>
          <p className={styles.subtitle}>Join TransBridge to start shipping between the UK and Nigeria.</p>

          <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className={styles.row}>
              <div className='form-group'>
                <label className='form-label'>First Name</label>
                <div className={styles.inputIconWrap}>
                  <User size={16} className={styles.inputIcon} />
                  <input
                    className={`form-input ${errors.firstName ? 'error' : ''}`}
                    placeholder='John'
                    {...register('firstName', { required: 'Required' })}
                  />
                </div>
                {errors.firstName && <span className='form-error'>{errors.firstName.message}</span>}
              </div>
              <div className='form-group'>
                <label className='form-label'>Last Name</label>
                <div className={styles.inputIconWrap}>
                  <User size={16} className={styles.inputIcon} />
                  <input
                    className={`form-input ${errors.lastName ? 'error' : ''}`}
                    placeholder='Okafor'
                    {...register('lastName', { required: 'Required' })}
                  />
                </div>
                {errors.lastName && <span className='form-error'>{errors.lastName.message}</span>}
              </div>
            </div>

            <div className='form-group'>
              <label className='form-label'>Email Address</label>
              <div className={styles.inputIconWrap}>
                <Mail size={16} className={styles.inputIcon} />
                <input
                  type='email'
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder='john@example.com'
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email address' }
                  })}
                />
              </div>
              {errors.email && <span className='form-error'>{errors.email.message}</span>}
            </div>

            <div className='form-group'>
              <label className='form-label'>Phone Number</label>
              <div className={styles.row} style={{ gridTemplateColumns: '110px 1fr' }}>
                <select className='form-input' {...register('dialCode', { required: true })} defaultValue='+44'>
                  {COUNTRIES.map(c => <option key={c.code} value={c.dial}>{c.dial}</option>)}
                </select>
                <div className={styles.inputIconWrap}>
                  <Phone size={16} className={styles.inputIcon} />
                  <input
                    className={`form-input ${errors.phone ? 'error' : ''}`}
                    placeholder='7934 219309'
                    {...register('phone', { required: 'Phone number is required' })}
                  />
                </div>
              </div>
              {errors.phone && <span className='form-error'>{errors.phone.message}</span>}
            </div>

            <div className='form-group'>
              <label className='form-label'>Country</label>
              <div className={styles.inputIconWrap}>
                <Globe2 size={16} className={styles.inputIcon} />
                <select className='form-input' {...register('country', { required: true })} defaultValue='United Kingdom'>
                  {COUNTRIES.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className='form-group'>
              <label className='form-label'>Password</label>
              <div className={styles.inputIconWrap}>
                <Lock size={16} className={styles.inputIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder='Create a strong password'
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Minimum 8 characters' },
                    pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Must include upper, lower case and number' }
                  })}
                />
                <button type='button' className={styles.passwordToggle} onClick={() => setShowPassword(v => !v)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span className='form-error'>{errors.password.message}</span>}
            </div>

            <div className='form-group'>
              <label className='form-label'>Confirm Password</label>
              <div className={styles.inputIconWrap}>
                <Lock size={16} className={styles.inputIcon} />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder='Re-enter your password'
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: v => v === password || 'Passwords do not match'
                  })}
                />
                <button type='button' className={styles.passwordToggle} onClick={() => setShowConfirm(v => !v)}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <span className='form-error'>{errors.confirmPassword.message}</span>}
            </div>

            <button type='submit' className='btn btn-primary btn-lg' disabled={loading} style={{ justifyContent: 'center', marginTop: 8 }}>
              {loading ? <span className='loading-spinner' /> : <>Create Account <ArrowRight size={18} /></>}
            </button>
          </form>

          <p className={styles.footer}>
            Already have an account? <Link to='/login' className={styles.footerLink}>Sign In</Link>
          </p>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.rightContent}>
          <span className={styles.rightBadge}>Across Borders, On Time.</span>
          <h2 className={styles.rightTitle}>Secure Account, Verified Every Step.</h2>
          <p className={styles.rightText}>
            Your account is protected with dual-channel OTP verification sent to both your email and phone number.
          </p>
          <div className={styles.checkmarks}>
            <div className={styles.checkmarkItem}><ShieldCheck size={18} className={styles.checkIcon} /> Bank-grade encryption</div>
            <div className={styles.checkmarkItem}><Package size={18} className={styles.checkIcon} /> Real-time shipment tracking</div>
            <div className={styles.checkmarkItem}><Clock size={18} className={styles.checkIcon} /> 24/7 customer support</div>
          </div>
        </div>
      </div>
    </div>
  )
}
