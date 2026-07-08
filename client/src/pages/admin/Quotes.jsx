import { useState, useEffect, useCallback } from 'react'
import { FileText, X, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { quoteAPI } from '../../services/api'
import StatusBadge from '../../components/ui/StatusBadge'
import styles from '../Dashboard.module.css'

export default function AdminQuotes() {
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [selected, setSelected] = useState(null)
  const [responding, setResponding] = useState(false)
  const [form, setForm] = useState({ quotedPrice: '', currency: 'GBP', adminResponse: '', status: 'Quoted' })

  const loadQuotes = useCallback(async () => {
    setLoading(true)
    try {
      const res = await quoteAPI.getAll({ status })
      setQuotes(res.data.quotes)
    } catch {
      toast.error('Failed to load quotes')
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => { document.title = 'Quote Requests — Admin'; loadQuotes() }, [loadQuotes])

  const openQuote = (q) => {
    setSelected(q)
    setForm({ quotedPrice: q.quotedPrice || '', currency: q.currency || 'GBP', adminResponse: q.adminResponse || '', status: q.status === 'Pending' ? 'Quoted' : q.status })
  }

  const submitResponse = async () => {
    setResponding(true)
    try {
      await quoteAPI.update(selected._id, form)
      toast.success('Quote response sent')
      setSelected(null)
      loadQuotes()
    } catch {
      toast.error('Failed to send response')
    } finally {
      setResponding(false)
    }
  }

  return (
    <div>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Quote Requests</h1>
          <p className={styles.pageSub}>Respond to customer shipping quote requests</p>
        </div>
      </div>

      <div className={styles.toolbar}>
        <select className={styles.filterSelect} value={status} onChange={e => setStatus(e.target.value)}>
          <option value=''>All Statuses</option>
          <option value='Pending'>Pending</option>
          <option value='Quoted'>Quoted</option>
          <option value='Accepted'>Accepted</option>
          <option value='Declined'>Declined</option>
        </select>
      </div>

      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.loadingWrap}><span className='loading-spinner' style={{ width: 28, height: 28 }} /></div>
        ) : quotes.length === 0 ? (
          <div className={styles.emptyState}><FileText size={40} className={styles.emptyIcon} /><p>No quote requests found.</p></div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr><th>Name</th><th>Service</th><th>Route</th><th>Status</th><th>Submitted</th></tr>
            </thead>
            <tbody>
              {quotes.map(q => (
                <tr key={q._id} className={styles.clickableRow} onClick={() => openQuote(q)}>
                  <td className={styles.cellPrimary}>{q.fullName}<br /><span className={styles.cellMuted}>{q.email}</span></td>
                  <td>{q.serviceType}</td>
                  <td className={styles.cellMuted}>{q.origin} → {q.destination}</td>
                  <td><StatusBadge status={q.status} /></td>
                  <td className={styles.cellMuted}>{new Date(q.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <div className='overlay' onClick={() => setSelected(null)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 480, maxWidth: '90vw', background: 'var(--bg-primary)', borderRadius: 16, padding: 28, maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800 }}>Quote Request</h2>
              <button className={styles.iconBtnSm} onClick={() => setSelected(null)}><X size={16} /></button>
            </div>

            <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 16, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 13 }}><strong>{selected.fullName}</strong> · {selected.email} · {selected.phone}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{selected.serviceType} · {selected.origin} → {selected.destination}</div>
              {selected.weight && <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Weight: {selected.weight}kg · {selected.packageType}</div>}
              {selected.description && <div style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>"{selected.description}"</div>}
            </div>

            <div className='form-group' style={{ marginBottom: 14 }}>
              <label className='form-label'>Status</label>
              <select className='form-input' value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value='Quoted'>Quoted</option>
                <option value='Accepted'>Accepted</option>
                <option value='Declined'>Declined</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: 12, marginBottom: 14 }}>
              <div className='form-group'>
                <label className='form-label'>Quoted Price</label>
                <input type='number' className='form-input' value={form.quotedPrice} onChange={e => setForm(f => ({ ...f, quotedPrice: e.target.value }))} />
              </div>
              <div className='form-group'>
                <label className='form-label'>Currency</label>
                <select className='form-input' value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
                  <option value='GBP'>GBP</option>
                  <option value='NGN'>NGN</option>
                  <option value='USD'>USD</option>
                </select>
              </div>
            </div>

            <div className='form-group' style={{ marginBottom: 20 }}>
              <label className='form-label'>Response Message</label>
              <textarea className='form-input' rows={4} value={form.adminResponse} onChange={e => setForm(f => ({ ...f, adminResponse: e.target.value }))} placeholder='Write your response to the customer...' />
            </div>

            <button className='btn btn-primary' style={{ width: '100%', justifyContent: 'center' }} disabled={responding} onClick={submitResponse}>
              {responding ? <span className='loading-spinner' /> : <><Send size={15} /> Send Response</>}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
