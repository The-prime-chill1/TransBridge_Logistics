import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Lock, Eye, EyeOff, Save, Settings as SettingsIcon, Building2 } from 'lucide-react'
import {
  getAuth,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  verifyBeforeUpdateEmail,
} from 'firebase/auth'
import { useAuth } from '../../context/AuthContext'
import styles from '../Dashboard.module.css'

export default function AdminSettings() {
  const { user } = useAuth()
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [email, setEmail] = useState(user?.email || '')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  // ── Email change ────────────────────────────────────────────────
  const onChangeEmail = async (e) => {
    e.preventDefault()
    if (!email || email === user?.email) {
      toast.error('Please enter a new email address')
      return
    }
    setSaving(true)
    try {
      const auth = getAuth()
      await verifyBeforeUpdateEmail(auth.currentUser, email)
      toast.success('Verification email sent! Check your new inbox and click the link to confirm the change.')
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Failed to send verification email')
    } finally {
      setSaving(false)
    }
  }

  // ── Password change ─────────────────────────────────────────────
  const onChangePassword = async (data) => {
    setSaving(true)
    try {
      const auth = getAuth()
      const credential = EmailAuthProvider.credential(
        user.email,
        data.currentPassword
      )
      await reauthenticateWithCredential(auth.currentUser, credential)
      await updatePassword(auth.currentUser, data.newPassword)
      toast.success('Password updated successfully')
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div>
      {/* Page Header */}
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Settings</h1>
          <p className={styles.pageSub}>Manage your account and platform preferences</p>
        </div>
      </div>

      <div className={styles.grid2}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Account Information */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <Building2 size={16} /> Account Information
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  className="form-input"
                  value={`${user?.firstName || ''} ${user?.lastName || ''}`}
                  disabled
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter new email address"
                />
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '4px 0 6px' }}>
                  A verification link will be sent to the new address. Current email stays active until confirmed.
                </p>
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={onChangeEmail}
                  disabled={saving}
                >
                  {saving ? <span className="loading-spinner" /> : <><Save size={14} /> Send Verification Email</>}
                </button>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  className="form-input"
                  value={user?.phone || ''}
                  disabled
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role</label>
                <input
                  className="form-input"
                  value={user?.role || ''}
                  disabled
                  style={{ textTransform: 'capitalize' }}
                />
              </div>

            </div>
          </div>

          {/* Change Password */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <Lock size={16} /> Change Password
            </h3>
            <form onSubmit={handleSubmit(onChangePassword)}>

              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label">Current Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    className={`form-input${errors.currentPassword ? ' error' : ''}`}
                    {...register('currentPassword', { required: 'Required' })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((v) => !v)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-light)',
                    }}
                  >
                    {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.currentPassword && (
                  <span className="form-error">{errors.currentPassword.message}</span>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label">New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNew ? 'text' : 'password'}
                    className={`form-input${errors.newPassword ? ' error' : ''}`}
                    {...register('newPassword', {
                      required: 'Required',
                      minLength: { value: 8, message: 'Minimum 8 characters' },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-light)',
                    }}
                  >
                    {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.newPassword && (
                  <span className="form-error">{errors.newPassword.message}</span>
                )}
              </div>

              <p style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 16, lineHeight: 1.5 }}>
                You will need your current password to confirm this change.
              </p>

              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving
                  ? <span className="loading-spinner" />
                  : <><Save size={15} /> Update Password</>
                }
              </button>

            </form>
          </div>

        </div>

        {/* Right column – Platform Info */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>
            <SettingsIcon size={16} /> Platform Info
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
            {[
              ['Company', 'TransBridge Logistics'],
              ['Tagline', 'Across Borders, On Time.'],
              ['UK Contact', '+44 7934 219309'],
              ['Nigeria Contact', '08165595873'],
              ['Support Email', 'Transbridgelogistics01@gmail.com'],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                <span style={{ fontWeight: 600, fontSize: label === 'Support Email' ? 12 : 13 }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
