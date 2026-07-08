import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  User, Mail, Phone, Lock, Eye, EyeOff, Globe2,
  ShieldCheck, Package, Clock, ArrowRight
} from 'lucide-react'
import { 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signInWithPhoneNumber, 
  updateProfile 
} from 'firebase/auth'
import { auth, googleProvider, setupRecaptcha } from '../../config/firebase'
import styles from './Auth.module.css'

const COUNTRIES = [
  { code: 'GB', name: 'United Kingdom', dial: '+44' },
  { code: 'NG', name: 'Nigeria', dial: '+234' },
]

export default function Register() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Phone Auth State
  const [usePhoneAuth, setUsePhoneAuth] = useState(false)
  const [confirmationResult, setConfirmationResult] = useState(null)
  const [otpCode, setOtpCode] = useState('')

  const navigate = useNavigate()
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const password = watch('password')

  useEffect(() => {
    // Setup recaptcha for phone auth
    setupRecaptcha('recaptcha-container')
  }, [])

  const onEmailSubmit = async (data) => {
    setLoading(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password)
      await updateProfile(userCredential.user, {
        displayName: `${data.firstName} ${data.lastName}`
      })
      toast.success('Registration successful!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
      toast.success('Google Sign-In successful!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.message || 'Google Sign-In failed')
    }
  }

  const handleSendOtp = async (data) => {
    setLoading(true)
    try {
      const phoneNumber = `${data.dialCode}${data.phone}`
      const appVerifier = window.recaptchaVerifier
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier)
      setConfirmationResult(confirmation)
      toast.success('OTP Sent!')
    } catch (err) {
      toast.error(err.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    setLoading(true)
    try {
      await confirmationResult.confirm(otpCode)
      toast.success('Phone verified successfully!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.wrap}>
      {/* Invisible Recaptcha Container always present on mount */}
      <div id="recaptcha-container"></div>
      
      <div className={styles.left}>
        <div className={styles.formBox}>
          <Link to='/' className={styles.logo}>
            <div className={styles.logoMark}>TB</div>
            <span className={styles.logoText}>TRANS<span className={styles.logoAccent}>BRIDGE</span></span>
          </Link>

          <h1 className={styles.title}>Create Your Account</h1>
          <p className={styles.subtitle}>Join TransBridge to start shipping today.</p>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button 
              type="button" 
              className={`btn ${!usePhoneAuth ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setUsePhoneAuth(false)}
              style={{ flex: 1, padding: '10px' }}
            >
              Email & Google
            </button>
            <button 
              type="button" 
              className={`btn ${usePhoneAuth ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setUsePhoneAuth(true)}
              style={{ flex: 1, padding: '10px' }}
            >
              Phone OTP
            </button>
          </div>

          {!usePhoneAuth ? (
            <>
              <button 
                type="button" 
                className="btn btn-google" 
                onClick={handleGoogleSignIn}
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: 18 }} />
                Continue with Google
              </button>
              
              <div style={{ textAlign: 'center', margin: '10px 0', color: '#666' }}>or</div>

              <form className={styles.form} onSubmit={handleSubmit(onEmailSubmit)} noValidate>
                <div className={styles.row}>
                  <div className='form-group'>
                    <label className='form-label'>First Name</label>
                    <div className={styles.inputIconWrap}>
                      <User size={16} className={styles.inputIcon} />
                      <input className={`form-input ${errors.firstName ? 'error' : ''}`} placeholder='John' {...register('firstName', { required: 'Required' })} />
                    </div>
                  </div>
                  <div className='form-group'>
                    <label className='form-label'>Last Name</label>
                    <div className={styles.inputIconWrap}>
                      <User size={16} className={styles.inputIcon} />
                      <input className={`form-input ${errors.lastName ? 'error' : ''}`} placeholder='Okafor' {...register('lastName', { required: 'Required' })} />
                    </div>
                  </div>
                </div>

                <div className='form-group'>
                  <label className='form-label'>Email Address</label>
                  <div className={styles.inputIconWrap}>
                    <Mail size={16} className={styles.inputIcon} />
                    <input type='email' className={`form-input ${errors.email ? 'error' : ''}`} placeholder='john@example.com' {...register('email', { required: 'Email is required' })} />
                  </div>
                </div>

                <div className='form-group'>
                  <label className='form-label'>Password</label>
                  <div className={styles.inputIconWrap}>
                    <Lock size={16} className={styles.inputIcon} />
                    <input type={showPassword ? 'text' : 'password'} className={`form-input ${errors.password ? 'error' : ''}`} placeholder='Create a strong password' {...register('password', { required: 'Password is required' })} />
                    <button type='button' className={styles.passwordToggle} onClick={() => setShowPassword(v => !v)}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button type='submit' className='btn btn-primary btn-lg' disabled={loading} style={{ justifyContent: 'center', marginTop: 8 }}>
                  {loading ? <span className='loading-spinner' /> : <>Create Account <ArrowRight size={18} /></>}
                </button>
              </form>
            </>
          ) : (
            <div className={styles.form}>
              {!confirmationResult ? (
                <form onSubmit={handleSubmit(handleSendOtp)}>
                  <div className='form-group'>
                    <label className='form-label'>Phone Number</label>
                    <div className={styles.row} style={{ gridTemplateColumns: '110px 1fr' }}>
                      <select className='form-input' {...register('dialCode', { required: true })} defaultValue='+234'>
                        {COUNTRIES.map(c => <option key={c.code} value={c.dial}>{c.dial}</option>)}
                      </select>
                      <div className={styles.inputIconWrap}>
                        <Phone size={16} className={styles.inputIcon} />
                        <input className={`form-input ${errors.phone ? 'error' : ''}`} placeholder='913 763 2195' {...register('phone', { required: 'Phone is required' })} />
                      </div>
                    </div>
                  </div>
                  <button type='submit' className='btn btn-primary btn-lg' disabled={loading} style={{ justifyContent: 'center', marginTop: 8 }}>
                    {loading ? <span className='loading-spinner' /> : <>Send OTP <ArrowRight size={18} /></>}
                  </button>
                </form>
              ) : (
                <div className='form-group'>
                  <label className='form-label'>Enter OTP</label>
                  <input type='text' className='form-input' value={otpCode} onChange={(e) => setOtpCode(e.target.value)} placeholder='242424' />
                  <button type='button' className='btn btn-primary btn-lg' onClick={handleVerifyOtp} disabled={loading || !otpCode} style={{ justifyContent: 'center', marginTop: 8, width: '100%' }}>
                    {loading ? <span className='loading-spinner' /> : <>Verify OTP <ArrowRight size={18} /></>}
                  </button>
                </div>
              )}
            </div>
          )}

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

