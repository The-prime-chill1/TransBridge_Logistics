import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Lock, Eye, EyeOff, Save, Settings as SettingsIcon, Building2 } from 'lucide-react'
import { authAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import styles from '../Dashboard.module.css'

export default function AdminSettings() {
  const { user } = useAuth()
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm()
  const newPassword = watch('newPassword')

  const onChangePassword = async (data) => {
    setSaving(true)
    try {
      await authAPI.changePassword({ step: 'request-otp', currentPassword: data.currentPassword })
      toast.success('Verification code sent to your email and phone')
      // In a full implementation this would open an OTP modal then call step: 'confirm'
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate password change')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Settings</h1>
          <p className={styles.pageSub}>Manage your account and platform preferences</p>
        </div>
      </div>

      <div className={styles.grid2}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}><Building2 size={16} /> Account Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className='form-group'>
                <label className='form-label'>Full Name</label>
                <input className='form-input' value={`${user?.firstName} ${user?.lastName}`} disabled />
              </div>
              <div className='form-group'>
                <label className='form-label'>Email Address</label>
                <input className='form-input' value={user?.email} disabled />
              </div>
              <div className='form-group'>
                <label className='form-label'>Phone Number</label>
                <input className='form-input' value={user?.phone} disabled />
              </div>
              <div className='form-group'>
                <label className='form-label'>Role</label>
                <input className='form-input' value={user?.role} disabled style={{ textTransform: 'capitalize' }} />
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}><Lock size={16} /> Change Password</h3>
            <form onSubmit={handleSubmit(onChangePassword)}>
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
              </div>
              <div className='form-group' style={{ marginBottom: 14 }}>
                <label className='form-label'>New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNew ? 'text' : 'password'}
                    className={`form-input ${errors.newPassword ? 'error' : ''}`}
                    {...register('newPassword', { required: 'Required', minLength: { value: 8, message: 'Minimum 8 characters' } })}
                  />
                  <button type='button' onClick={() => setShowNew(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }}>
                    {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.newPassword && <span className='form-error'>{errors.newPassword.message}</span>}
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 16, lineHeight: 1.5 }}>
                A verification code will be sent to your email and phone to confirm this change.
              </p>
              <button type='submit' className='btn btn-primary' disabled={saving}>
                {saving ? <span className='loading-spinner' /> : <><Save size={15} /> Update Password</>}
              </button>
            </form>
          </div>
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}><SettingsIcon size={16} /> Platform Info</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Company</span>
              <span style={{ fontWeight: 600 }}>TransBridge Logistics</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Tagline</span>
              <span style={{ fontWeight: 600 }}>Across Borders, On Time.</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>UK Contact</span>
              <span style={{ fontWeight: 600 }}>+44 7934 219309</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Nigeria Contact</span>
              <span style={{ fontWeight: 600 }}>08165595873</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Support Email</span>
              <span style={{ fontWeight: 600, fontSize: 12 }}>Transbridgelogistics01@gmail.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
