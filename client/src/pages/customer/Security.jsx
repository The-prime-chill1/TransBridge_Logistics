import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Shield, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { authAPI } from '../../services/api'
import OTPInput from '../../components/ui/OTPInput'
import styles from '../Dashboard.module.css'

export default function CustomerSecurity() {
  const [step, setStep] = useState('form') // form | otp
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [loading, setLoading] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState('')
  const [pendingData, setPendingData] = useState(null)

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm()
  const newPassword = watch('newPassword')

  const onRequestOTP = async (data) => {
    setLoading(true)
    try {
      await authAPI.changePassword({ step: 'request-otp', currentPassword: data.currentPassword })
      setPendingData(data)
      setStep('otp')
      toast.success('Verification code sent to your email and phone')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Current password is incorrect')
    } finally {
      setLoading(false)
    }
  }

  const onConfirmOTP = async (e) => {
    e.preventDefault()
    if (otp.length !== 5) { setOtpError('Please enter the complete 5-digit code'); return }
    setLoading(true)
    setOtpError('')
    try {
      await authAPI.changePassword({ step: 'confirm', otp, newPassword: pendingData.newPassword })
      toast.success('Password changed successfully. Please log in again.')
      setStep('form')
      reset()
      setOtp('')
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Invalid or expired code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Security</h1>
          <p className={styles.pageSub}>Manage your password and account security</p>
        </div>
      </div>

      <div className={styles.card} style={{ maxWidth: 480 }}>
        <h3 className={styles.cardTitle}><Lock size={16} /> Change Password</h3>

        {step === 'form' ? (
          <form onSubmit={handleSubmit(onRequestOTP)}>
            <div className='form-group' style={{ marginBottom: 14 }}>
              <label className='form-label'>Current Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrent ? 'text' : 'password'}
                  className={`form-input ${errors.currentPassword ? 'error' : ''}`}
                  {...register('currentPassword', { required: 'Required' })}
                />
                <button type='button' onClick={() => setShowCurrent(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }}>
                  {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.currentPassword && <span className='form-error'>{errors.currentPassword.message}</span>}
            </div>

            <div className='form-group' style={{ marginBottom: 14 }}>
              <label className='form-label'>New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNew ? 'text' : 'password'}
                  className={`form-input ${errors.newPassword ? 'error' : ''}`}
                  {...register('newPassword', {
                    required: 'Required',
                    minLength: { value: 8, message: 'Minimum 8 characters' },
                    pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Must include upper, lower case and number' },
                  })}
                />
                <button type='button' onClick={() => setShowNew(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }}>
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.newPassword && <span className='form-error'>{errors.newPassword.message}</span>}
            </div>

            <div className='form-group' style={{ marginBottom: 20 }}>
              <label className='form-label'>Confirm New Password</label>
              <input
                type='password'
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                {...register('confirmPassword', { required: 'Required', validate: v => v === newPassword || 'Passwords do not match' })}
              />
              {errors.confirmPassword && <span className='form-error'>{errors.confirmPassword.message}</span>}
            </div>

            <p style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 16, lineHeight: 1.5 }}>
              We'll send a verification code to your email and phone to confirm this change.
            </p>

            <button type='submit' className='btn btn-primary' disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? <span className='loading-spinner' /> : <>Continue <ArrowRight size={15} /></>}
            </button>
          </form>
        ) : (
          <form onSubmit={onConfirmOTP}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(212,160,23,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Shield size={22} color='var(--color-gold-dark)' />
            </div>
            <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
              Enter the 5-digit verification code sent to your email and phone to confirm your password change.
            </p>
            <div style={{ marginBottom: 24 }}>
              <OTPInput length={5} value={otp} onChange={setOtp} error={otpError} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type='button' className='btn btn-secondary' style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep('form')}>Back</button>
              <button type='submit' className='btn btn-primary' disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
                {loading ? <span className='loading-spinner' /> : 'Confirm Change'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
