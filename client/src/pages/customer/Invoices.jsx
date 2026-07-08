import { useState, useEffect } from 'react'
import { CreditCard, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import { shipmentAPI } from '../../services/api'
import styles from '../Dashboard.module.css'

// Invoices are derived from paid/priced shipments in this implementation.
export default function CustomerInvoices() {
  const [shipments, setShipments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'Invoices — TransBridge'
    load()
  }, [])

  const load = async () => {
    try {
      const res = await shipmentAPI.getMyShipments({ limit: 50 })
      setShipments(res.data.shipments.filter(s => s.price > 0))
    } catch {
      toast.error('Failed to load invoices')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Invoices</h1>
          <p className={styles.pageSub}>Billing history for your shipments</p>
        </div>
      </div>

      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.loadingWrap}><span className='loading-spinner' style={{ width: 28, height: 28 }} /></div>
        ) : shipments.length === 0 ? (
          <div className={styles.emptyState}>
            <CreditCard size={40} className={styles.emptyIcon} />
            <p>No invoices yet.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead><tr><th>Tracking #</th><th>Service</th><th>Amount</th><th>Payment Status</th><th>Date</th><th></th></tr></thead>
            <tbody>
              {shipments.map(s => (
                <tr key={s._id}>
                  <td className={styles.cellPrimary}>{s.trackingNumber}</td>
                  <td className={styles.cellMuted}>{s.courier}</td>
                  <td>{s.currency} {s.price.toLocaleString()}</td>
                  <td><span className={`badge badge-${s.paymentStatus === 'Paid' ? 'success' : 'warning'}`}>{s.paymentStatus}</span></td>
                  <td className={styles.cellMuted}>{new Date(s.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td>
                    <button className={styles.iconBtnSm} title='Download invoice (PDF generation pending integration)'>
                      <Download size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
