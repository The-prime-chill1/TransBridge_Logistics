import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react'
import { authAPI } from '../../services/api'
import styles from './Auth.module.css'

export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { email, phone, identifier, resetToken } = location.state || {}
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const password = watch('password')

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await authAPI.resetPassword({
        email, phone, identifier, resetToken,
        newPassword: data.password,
      })
      toast.success('Password reset successfully! Please sign in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password')
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

          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(0,135,81,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <CheckCircle2 size={26} color='var(--color-green)' />
          </div>

          <h1 className={styles.title}>Create New Password</h1>
          <p className={styles.subtitle}>Your identity has been verified. Set a new password for your account.</p>

          <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className='form-group'>
              <label className='form-label'>New Password</label>
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
              <label className='form-label'>Confirm New Password</label>
              <div className={styles.inputIconWrap}>
                <Lock size={16} className={styles.inputIcon} />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder='Re-enter your new password'
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
              {loading ? <span className='loading-spinner' /> : <>Reset Password <ArrowRight size={18} /></>}
            </button>
          </form>

          <p className={styles.footer}>
            Remembered it after all? <Link to='/login' className={styles.footerLink}>Sign In</Link>
          </p>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.rightContent}>
          <span className={styles.rightBadge}>Almost Done</span>
          <h2 className={styles.rightTitle}>Choose a Strong Password</h2>
          <p className={styles.rightText}>
            Use a mix of uppercase, lowercase letters, and numbers to keep your TransBridge account secure.
          </p>
        </div>
      </div>
    </div>
  )
}
