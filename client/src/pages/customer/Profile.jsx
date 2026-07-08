import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { User, Camera, Save } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { userAPI } from '../../services/api'
import styles from '../Dashboard.module.css'

export default function CustomerProfile() {
  const { user, updateUser } = useAuth()
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileRef = useRef(null)
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { firstName: user?.firstName, lastName: user?.lastName, country: user?.country },
  })

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase()

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      const res = await userAPI.updateProfile(data)
      updateUser(res.data.user)
      toast.success('Profile updated successfully')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      const res = await userAPI.uploadAvatar(formData)
      updateUser(res.data.user)
      toast.success('Avatar updated')
    } catch {
      toast.error('Failed to upload avatar')
    } finally {
      setUploadingAvatar(false)
    }
  }

  return (
    <div>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Profile</h1>
          <p className={styles.pageSub}>Manage your personal information</p>
        </div>
      </div>

      <div className={styles.grid2}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}><User size={16} /> Personal Information</h3>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div className='form-group'>
                <label className='form-label'>First Name</label>
                <input className={`form-input ${errors.firstName ? 'error' : ''}`} {...register('firstName', { required: 'Required' })} />
              </div>
              <div className='form-group'>
                <label className='form-label'>Last Name</label>
                <input className={`form-input ${errors.lastName ? 'error' : ''}`} {...register('lastName', { required: 'Required' })} />
              </div>
            </div>
            <div className='form-group' style={{ marginBottom: 14 }}>
              <label className='form-label'>Email Address</label>
              <input className='form-input' value={user?.email} disabled />
              <span className='form-hint'>Email cannot be changed. Contact support if needed.</span>
            </div>
            <div className='form-group' style={{ marginBottom: 14 }}>
              <label className='form-label'>Phone Number</label>
              <input className='form-input' value={user?.phone} disabled />
            </div>
            <div className='form-group' style={{ marginBottom: 20 }}>
              <label className='form-label'>Country</label>
              <select className='form-input' {...register('country')}>
                <option value='United Kingdom'>United Kingdom</option>
                <option value='Nigeria'>Nigeria</option>
              </select>
            </div>
            <button type='submit' className='btn btn-primary' disabled={saving}>
              {saving ? <span className='loading-spinner' /> : <><Save size={15} /> Save Changes</>}
            </button>
          </form>
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Profile Photo</h3>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-navy), var(--color-navy-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#fff', overflow: 'hidden' }}>
                {user?.avatar?.url ? <img src={user.avatar.url} alt='' style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                style={{ position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, borderRadius: '50%', background: 'var(--color-gold)', border: '2px solid var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-navy-dark)' }}
              >
                {uploadingAvatar ? <span className='loading-spinner' style={{ width: 12, height: 12, borderColor: 'rgba(7,18,40,0.3)', borderTopColor: 'var(--color-navy-dark)' }} /> : <Camera size={14} />}
              </button>
              <input ref={fileRef} type='file' accept='image/*' hidden onChange={handleAvatarChange} />
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>JPG, PNG or WEBP. Max 10MB.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
