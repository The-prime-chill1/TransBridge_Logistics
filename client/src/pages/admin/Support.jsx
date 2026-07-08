import { useState, useEffect, useCallback, useRef } from 'react'
import { HeadphonesIcon, Send, X, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { supportAPI } from '../../services/api'
import StatusBadge from '../../components/ui/StatusBadge'
import styles from '../Dashboard.module.css'

export default function AdminSupport() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [selected, setSelected] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  const loadTickets = useCallback(async () => {
    setLoading(true)
    try {
      const res = await supportAPI.getAll({ status })
      setTickets(res.data.tickets)
    } catch {
      toast.error('Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => { document.title = 'Support Center — Admin'; loadTickets() }, [loadTickets])

  const openTicket = async (t) => {
    try {
      const res = await supportAPI.getOne(t._id)
      setSelected(res.data.ticket)
    } catch {
      toast.error('Failed to load ticket')
    }
  }

  const sendReply = async () => {
    if (!replyText.trim()) return
    setSending(true)
    try {
      const res = await supportAPI.reply(selected._id, { message: replyText })
      setSelected(res.data.ticket)
      setReplyText('')
      loadTickets()
    } catch {
      toast.error('Failed to send reply')
    } finally {
      setSending(false)
    }
  }

  const closeTicket = async () => {
    try {
      await supportAPI.close(selected._id)
      toast.success('Ticket closed')
      setSelected(prev => ({ ...prev, status: 'Closed' }))
      loadTickets()
    } catch {
      toast.error('Failed to close ticket')
    }
  }

  return (
    <div>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Support Center</h1>
          <p className={styles.pageSub}>Manage customer support tickets</p>
        </div>
      </div>

      <div className={styles.toolbar}>
        <select className={styles.filterSelect} value={status} onChange={e => setStatus(e.target.value)}>
          <option value=''>All Statuses</option>
          <option value='Open'>Open</option>
          <option value='In Progress'>In Progress</option>
          <option value='Resolved'>Resolved</option>
          <option value='Closed'>Closed</option>
        </select>
      </div>

      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.loadingWrap}><span className='loading-spinner' style={{ width: 28, height: 28 }} /></div>
        ) : tickets.length === 0 ? (
          <div className={styles.emptyState}><HeadphonesIcon size={40} className={styles.emptyIcon} /><p>No support tickets found.</p></div>
        ) : (
          <table className={styles.table}>
            <thead><tr><th>Ticket #</th><th>Customer</th><th>Subject</th><th>Priority</th><th>Status</th></tr></thead>
            <tbody>
              {tickets.map(t => (
                <tr key={t._id} className={styles.clickableRow} onClick={() => openTicket(t)}>
                  <td className={styles.cellPrimary}>{t.ticketNumber}</td>
                  <td>{t.customer?.firstName} {t.customer?.lastName}</td>
                  <td className={styles.cellMuted}>{t.subject}</td>
                  <td><span className={`badge badge-${t.priority === 'Urgent' || t.priority === 'High' ? 'danger' : 'muted'}`}>{t.priority}</span></td>
                  <td><StatusBadge status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <div className='overlay' onClick={() => setSelected(null)} style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 460, maxWidth: '92vw', height: '100%', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: 22, borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800 }}>{selected.subject}</h2>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{selected.ticketNumber} · {selected.customer?.firstName} {selected.customer?.lastName}</p>
                </div>
                <button className={styles.iconBtnSm} onClick={() => setSelected(null)}><X size={16} /></button>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <StatusBadge status={selected.status} />
                {selected.status !== 'Closed' && (
                  <button className='btn btn-ghost btn-sm' onClick={closeTicket}><CheckCircle2 size={13} /> Close Ticket</button>
                )}
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {selected.messages?.map((m, i) => (
                <div key={i} style={{ alignSelf: m.senderRole === 'customer' ? 'flex-start' : 'flex-end', maxWidth: '80%' }}>
                  <div style={{
                    background: m.senderRole === 'customer' ? 'var(--bg-secondary)' : 'var(--gradient-gold)',
                    color: m.senderRole === 'customer' ? 'var(--text-primary)' : 'var(--color-navy-dark)',
                    padding: '10px 14px', borderRadius: 12, fontSize: 13.5, lineHeight: 1.5,
                  }}>
                    {m.message}
                  </div>
                  <span style={{ fontSize: 10.5, color: 'var(--text-light)', marginTop: 4, display: 'block', textAlign: m.senderRole === 'customer' ? 'left' : 'right' }}>
                    {m.senderRole === 'customer' ? 'Customer' : 'Support'} · {new Date(m.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>

            {selected.status !== 'Closed' && (
              <div style={{ padding: 18, borderTop: '1px solid var(--border-color)', display: 'flex', gap: 10 }}>
                <input
                  className='form-input'
                  placeholder='Type your reply...'
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendReply()}
                />
                <button className='btn btn-primary btn-icon' disabled={sending} onClick={sendReply}>
                  {sending ? <span className='loading-spinner' /> : <Send size={16} />}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
