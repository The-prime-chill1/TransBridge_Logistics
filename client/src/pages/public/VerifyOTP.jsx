import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ShieldCheck, Mail, Phone, ArrowRight, RotateCw } from 'lucide-react'
import OTPInput from '../../components/ui/OTPInput'
import { authAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import styles from './Auth.module.css'

export default function VerifyOTP() {
  const navigate = useNavigate()
  const location = useLocation()
  const { checkAuth } = useAuth()
  const { email, phone, identifier, type = 'registration' } = location.state || {}

  const otpLength = type === 'registration' ? 4 : 5
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(60)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!email && !phone && !identifier) {
      navigate('/register')
      return
    }
    intervalRef.current = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(intervalRef.current); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [])

  const handleVerify = async (e) => {
    e.preventDefault()
    if (otp.length !== otpLength) {
      setError(`Please enter the complete ${otpLength}-digit code`)
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await authAPI.verifyOTP({ email, phone, identifier, otp, type })
      if (res.data.token) {
        localStorage.setItem('tb-token', res.data.token)
        await checkAuth()
        toast.success('Account verified successfully!')
        navigate('/dashboard')
      } else {
        toast.success('Verified successfully!')
        navigate('/reset-password', { state: { email, phone, identifier, resetToken: res.data.resetToken } })
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return
    try {
      await authAPI.resendOTP({ email, phone, identifier, type })
      toast.success('A new code has been sent')
      setResendCooldown(60)
      intervalRef.current = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) { clearInterval(intervalRef.current); return 0 }
          return prev - 1
        })
      }, 1000)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend code')
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
            <ShieldCheck size={26} color='var(--color-gold-dark)' />
          </div>

          <h1 className={styles.title}>Verify Your Identity</h1>
          <p className={styles.subtitle}>
            We've sent a {otpLength}-digit code to both your email and phone number. Enter it below to continue.
          </p>

          {(email || phone) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24, padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
              {email && <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}><Mail size={14} /> {email}</div>}
              {phone && <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}><Phone size={14} /> {phone}</div>}
            </div>
          )}

          <form className={styles.form} onSubmit={handleVerify}>
            <OTPInput length={otpLength} value={otp} onChange={setOtp} error={error} />

            <button type='submit' className='btn btn-primary btn-lg' disabled={loading} style={{ justifyContent: 'center', marginTop: 12 }}>
              {loading ? <span className='loading-spinner' /> : <>Verify Code <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className={styles.footer}>
            {resendCooldown > 0 ? (
              <span>Resend code in <strong>{resendCooldown}s</strong></span>
            ) : (
              <button onClick={handleResend} className={styles.footerLink} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <RotateCw size={14} /> Resend Code
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.rightContent}>
          <span className={styles.rightBadge}>Dual-Channel Security</span>
          <h2 className={styles.rightTitle}>Two-Step Verification</h2>
          <p className={styles.rightText}>
            Every TransBridge account is protected by OTP verification sent to both your email and SMS, ensuring only you can access your shipments.
          </p>
        </div>
      </div>
    </div>
  )
}
