import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { HeadphonesIcon, Plus, X, Send, MessageCircle } from 'lucide-react'
import {
  collection, query, where, getDocs, addDoc, doc, getDoc,
  updateDoc, arrayUnion, serverTimestamp
} from 'firebase/firestore'
import { db } from '../../config/firebase'
import { useAuth } from '../../context/AuthContext'
import StatusBadge from '../../components/ui/StatusBadge'
import styles from '../Dashboard.module.css'

const CATEGORIES = ['Shipment Issue', 'Billing', 'Account', 'General Inquiry', 'Complaint', 'Other']


export default function CustomerSupport() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [newModalOpen, setNewModalOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const [creating, setCreating] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => { document.title = 'Support — TransBridge'; if (user?.uid) loadTickets() }, [user])

  const loadTickets = async () => {
    setLoading(true)
    try {
      const q = query(collection(db, 'support_tickets'), where('userId', '==', user.uid))
      const snap = await getDocs(q)
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      list.sort((a, b) => {
        const da = a.updatedAt?.toDate ? a.updatedAt.toDate() : new Date(a.updatedAt || 0)
        const db2 = b.updatedAt?.toDate ? b.updatedAt.toDate() : new Date(b.updatedAt || 0)
        return db2 - da
      })
      setTickets(list)
    } catch (err) {
      console.error('Failed to load support tickets:', err)
    } finally {
      setLoading(false)
    }
  }

  const openTicket = async (t) => {
    try {
      const docSnap = await getDoc(doc(db, 'support_tickets', t.id))
      if (docSnap.exists()) setSelected({ id: docSnap.id, ...docSnap.data() })
    } catch (err) {
      toast.error('Failed to load ticket')
    }
  }

  const createTicket = async (data) => {
    setCreating(true)
    try {
      const ticketNumber = `TKT-${Date.now().toString().slice(-6)}`
      await addDoc(collection(db, 'support_tickets'), {
        userId: user.uid,
        userEmail: user.email,
        ticketNumber,
        subject: data.subject,
        category: data.category,
        status: 'Open',
        messages: [{
          message: data.message,
          senderRole: 'customer',
          createdAt: new Date().toISOString(),
        }],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      toast.success('Support ticket created')
      setNewModalOpen(false)
      reset()
      loadTickets()
    } catch (err) {
      console.error(err)
      toast.error('Failed to create ticket')
    } finally {
      setCreating(false)
    }
  }

  const sendReply = async () => {
    if (!replyText.trim()) return
    setSending(true)
    try {
      const newMsg = { message: replyText, senderRole: 'customer', createdAt: new Date().toISOString() }
      await updateDoc(doc(db, 'support_tickets', selected.id), {
        messages: arrayUnion(newMsg),
        updatedAt: serverTimestamp(),
      })
      setSelected(prev => ({ ...prev, messages: [...(prev.messages || []), newMsg] }))
      setReplyText('')
    } catch (err) {
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Support</h1>
          <p className={styles.pageSub}>Get help with your shipments and account</p>
        </div>
        <button className='btn btn-primary' onClick={() => setNewModalOpen(true)}><Plus size={16} /> New Ticket</button>
      </div>

      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.loadingWrap}><span className='loading-spinner' style={{ width: 28, height: 28 }} /></div>
        ) : tickets.length === 0 ? (
          <div className={styles.emptyState}>
            <HeadphonesIcon size={40} className={styles.emptyIcon} />
            <p>No support tickets yet. We're here whenever you need help.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead><tr><th>Ticket #</th><th>Subject</th><th>Category</th><th>Status</th><th>Last Updated</th></tr></thead>
            <tbody>
              {tickets.map(t => (
                <tr key={t.id} className={styles.clickableRow} onClick={() => openTicket(t)}>
                  <td className={styles.cellPrimary}>{t.ticketNumber}</td>
                  <td className={styles.cellMuted}>{t.subject}</td>
                  <td>{t.category}</td>
                  <td><StatusBadge status={t.status} /></td>
                  <td className={styles.cellMuted}>{new Date(t.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* New Ticket Modal */}
      {newModalOpen && (
        <div className='overlay' onClick={() => setNewModalOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 460, maxWidth: '90vw', background: 'var(--bg-primary)', borderRadius: 16, padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800 }}>New Support Ticket</h2>
              <button className={styles.iconBtnSm} onClick={() => setNewModalOpen(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit(createTicket)}>
              <div className='form-group' style={{ marginBottom: 14 }}>
                <label className='form-label'>Subject</label>
                <input className={`form-input ${errors.subject ? 'error' : ''}`} placeholder='Brief summary of your issue' {...register('subject', { required: 'Required' })} />
              </div>
              <div className='form-group' style={{ marginBottom: 14 }}>
                <label className='form-label'>Category</label>
                <select className='form-input' {...register('category')} defaultValue='General Inquiry'>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className='form-group' style={{ marginBottom: 20 }}>
                <label className='form-label'>Message</label>
                <textarea className={`form-input ${errors.message ? 'error' : ''}`} rows={5} placeholder='Describe your issue in detail...' {...register('message', { required: 'Required' })} />
              </div>
              <button type='submit' className='btn btn-primary' disabled={creating} style={{ width: '100%', justifyContent: 'center' }}>
                {creating ? <span className='loading-spinner' /> : 'Submit Ticket'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Detail Drawer */}
      {selected && (
        <div className='overlay' onClick={() => setSelected(null)} style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 460, maxWidth: '92vw', height: '100%', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: 22, borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800 }}>{selected.subject}</h2>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{selected.ticketNumber}</p>
                </div>
                <button className={styles.iconBtnSm} onClick={() => setSelected(null)}><X size={16} /></button>
              </div>
              <div style={{ marginTop: 10 }}><StatusBadge status={selected.status} /></div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {selected.messages?.map((m, i) => (
                <div key={i} style={{ alignSelf: m.senderRole === 'customer' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                  <div style={{
                    background: m.senderRole === 'customer' ? 'var(--gradient-gold)' : 'var(--bg-secondary)',
                    color: m.senderRole === 'customer' ? 'var(--color-navy-dark)' : 'var(--text-primary)',
                    padding: '10px 14px', borderRadius: 12, fontSize: 13.5, lineHeight: 1.5,
                  }}>
                    {m.message}
                  </div>
                  <span style={{ fontSize: 10.5, color: 'var(--text-light)', marginTop: 4, display: 'block', textAlign: m.senderRole === 'customer' ? 'right' : 'left' }}>
                    {m.senderRole === 'customer' ? 'You' : 'TransBridge Support'} · {new Date(m.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>

            {selected.status !== 'Closed' ? (
              <div style={{ padding: 18, borderTop: '1px solid var(--border-color)', display: 'flex', gap: 10 }}>
                <input className='form-input' placeholder='Type your message...' value={replyText} onChange={e => setReplyText(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendReply()} />
                <button className='btn btn-primary btn-icon' disabled={sending} onClick={sendReply}>
                  {sending ? <span className='loading-spinner' /> : <Send size={16} />}
                </button>
              </div>
            ) : (
              <div style={{ padding: 18, borderTop: '1px solid var(--border-color)', textAlign: 'center', fontSize: 12.5, color: 'var(--text-muted)' }}>
                This ticket has been closed.
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ marginTop: 24, padding: 18, background: 'var(--bg-secondary)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
        <MessageCircle size={20} color='var(--color-green)' />
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Need urgent help? Reach us directly on WhatsApp: <a href='https://wa.me/447934219309' target='_blank' rel='noopener noreferrer' style={{ color: 'var(--color-green)', fontWeight: 600 }}>+44 7934 219309</a> or <a href='https://wa.me/2348165595873' target='_blank' rel='noopener noreferrer' style={{ color: 'var(--color-green)', fontWeight: 600 }}>08165595873</a>
        </div>
      </div>
    </div>
  )
}
