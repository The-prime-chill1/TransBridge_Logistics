import { useState, useEffect, useCallback } from 'react'
import { Search, Users, Eye, Ban, CheckCircle, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore'
import { db } from '../../config/firebase'
import styles from '../Dashboard.module.css'

export default function AdminCustomers() {
  const [allCustomers, setAllCustomers] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 })
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [customerShipments, setCustomerShipments] = useState([])
  const PAGE_SIZE = 15

  // Load all customers once
  useEffect(() => {
    document.title = 'Customers — Admin'
    loadAll()
  }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const snap = await getDocs(query(collection(db, 'users'), where('role', '==', 'customer')))
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setAllCustomers(list)
    } catch (err) {
      console.error('Failed to load customers:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filter + paginate in memory
  useEffect(() => {
    const q = search.toLowerCase()
    const filtered = allCustomers.filter(c =>
      !q ||
      (c.firstName + ' ' + c.lastName).toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.includes(q)
    )
    const pages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1)
    const offset = (page - 1) * PAGE_SIZE
    setCustomers(filtered.slice(offset, offset + PAGE_SIZE))
    setPagination({ total: filtered.length, pages, page })
  }, [allCustomers, search, page])

  const viewCustomer = async (customer) => {
    setSelectedCustomer(customer)
    setDetailLoading(true)
    try {
      const snap = await getDocs(query(collection(db, 'shipments'), where('customerId', '==', customer.id)))
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      list.sort((a, b) => {
        const da = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
        const db2 = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
        return db2 - da
      })
      setCustomerShipments(list.slice(0, 5))
    } catch (err) {
      console.error('Failed to load customer shipments:', err)
    } finally {
      setDetailLoading(false)
    }
  }

  const toggleActive = async (id) => {
    const customer = allCustomers.find(c => c.id === id)
    if (!customer) return
    try {
      const newStatus = !customer.isActive
      await updateDoc(doc(db, 'users', id), { isActive: newStatus })
      setAllCustomers(prev => prev.map(c => c.id === id ? { ...c, isActive: newStatus } : c))
      if (selectedCustomer?.id === id) {
        setSelectedCustomer(prev => ({ ...prev, isActive: newStatus }))
      }
    } catch (err) {
      console.error('Failed to update status:', err)
    }
  }

  const formatDate = (val) => {
    if (!val) return '—'
    const d = val?.toDate ? val.toDate() : new Date(val)
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  return (
    <div>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Customers</h1>
          <p className={styles.pageSub}>{pagination.total} registered customers</p>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder='Search by name, email, or phone...'
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
      </div>

      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.loadingWrap}><span className='loading-spinner' style={{ width: 28, height: 28 }} /></div>
        ) : customers.length === 0 ? (
          <div className={styles.emptyState}>
            <Users size={40} className={styles.emptyIcon} />
            <p>No customers found.</p>
          </div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id} className={styles.clickableRow} onClick={() => viewCustomer(c)}>
                    <td className={styles.cellPrimary}>{c.firstName} {c.lastName}</td>
                    <td className={styles.cellMuted}>{c.email}<br />{c.phone}</td>
                    <td>
                      <span className={`badge ${c.isActive !== false ? 'badge-success' : 'badge-danger'}`}>
                        {c.isActive !== false ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className={styles.cellMuted}>{formatDate(c.createdAt)}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className={styles.actionsCell}>
                        <button className={styles.iconBtnSm} onClick={() => viewCustomer(c)} title='View'><Eye size={14} /></button>
                        <button
                          className={`${styles.iconBtnSm} ${c.isActive !== false ? styles.danger : ''}`}
                          onClick={() => toggleActive(c.id)}
                          title={c.isActive !== false ? 'Deactivate' : 'Activate'}
                        >
                          {c.isActive !== false ? <Ban size={14} /> : <CheckCircle size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={styles.pagination}>
              <span>Page {pagination.page} of {pagination.pages}</span>
              <div className={styles.pageBtns}>
                <button className={styles.pageBtn} disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /></button>
                <button className={styles.pageBtn} disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Customer Detail Drawer */}
      {selectedCustomer && (
        <div className='overlay' onClick={() => setSelectedCustomer(null)} style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 420, maxWidth: '90vw', height: '100%', background: 'var(--bg-primary)', padding: 28, overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>
                  {selectedCustomer.firstName} {selectedCustomer.lastName}
                </h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{selectedCustomer.email}</p>
              </div>
              <button className={styles.iconBtnSm} onClick={() => setSelectedCustomer(null)}><X size={16} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>Phone</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{selectedCustomer.phone || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>Country</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{selectedCustomer.country || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>Status</span>
                <span className={`badge ${selectedCustomer.isActive !== false ? 'badge-success' : 'badge-danger'}`}>
                  {selectedCustomer.isActive !== false ? 'Active' : 'Deactivated'}
                </span>
              </div>
            </div>

            <button
              className={`btn ${selectedCustomer.isActive !== false ? 'btn-secondary' : 'btn-primary'}`}
              style={{ width: '100%', justifyContent: 'center', marginBottom: 28 }}
              onClick={() => toggleActive(selectedCustomer.id)}
            >
              {selectedCustomer.isActive !== false ? <><Ban size={15} /> Deactivate Account</> : <><CheckCircle size={15} /> Activate Account</>}
            </button>

            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 }}>Recent Shipments</h3>
            {detailLoading ? (
              <div className={styles.loadingWrap}><span className='loading-spinner' /></div>
            ) : customerShipments.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No shipments yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {customerShipments.map(s => (
                  <div key={s.id} style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{s.trackingNumber}</span>
                      <span className={`badge badge-${s.status === 'Delivered' ? 'success' : 'warning'}`} style={{ fontSize: 10 }}>{s.status}</span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.origin} → {s.destination}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
