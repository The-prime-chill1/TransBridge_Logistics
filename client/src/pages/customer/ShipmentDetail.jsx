import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Calendar, Weight, User, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { shipmentAPI } from '../../services/api'
import { useSocket } from '../../context/SocketContext'
import ShipmentTimeline from '../../components/ui/ShipmentTimeline'
import StatusBadge from '../../components/ui/StatusBadge'
import styles from '../Dashboard.module.css'
import trackStyles from '../public/TrackShipment.module.css'

export default function CustomerShipmentDetail() {
  const { id } = useParams()
  const [shipment, setShipment] = useState(null)
  const [loading, setLoading] = useState(true)
  const { on, off } = useSocket()

  useEffect(() => {
    document.title = 'Shipment Details — TransBridge'
    load()
  }, [id])

  useEffect(() => {
    const handler = (updated) => {
      if (updated._id === id) {
        setShipment(updated)
        toast.success('Shipment status updated in real time')
      }
    }
    on?.('shipment:updated', handler)
    return () => off?.('shipment:updated', handler)
  }, [id, on, off])

  const load = async () => {
    setLoading(true)
    try {
      const res = await shipmentAPI.getOne(id)
      setShipment(res.data.shipment)
    } catch {
      toast.error('Failed to load shipment')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className={styles.loadingWrap}><span className='loading-spinner' style={{ width: 32, height: 32 }} /></div>
  if (!shipment) return null

  return (
    <div>
      <Link to='/dashboard/shipments' style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', marginBottom: 14 }}>
        <ArrowLeft size={15} /> Back to Shipments
      </Link>

      <div className={trackStyles.statusCard} style={{ marginBottom: 20 }}>
        <div className={trackStyles.statusHeader}>
          <div>
            <span className={trackStyles.trackingLabel}>Tracking Number</span>
            <h2 className={trackStyles.trackingNum}>{shipment.trackingNumber}</h2>
          </div>
          <StatusBadge status={shipment.status} />
        </div>
        <div className={trackStyles.infoGrid}>
          <div className={trackStyles.infoItem}><MapPin size={18} className={trackStyles.infoIcon} /><div><span className={trackStyles.infoLabel}>Origin</span><span className={trackStyles.infoValue}>{shipment.origin}</span></div></div>
          <div className={trackStyles.infoItem}><MapPin size={18} className={trackStyles.infoIcon} /><div><span className={trackStyles.infoLabel}>Destination</span><span className={trackStyles.infoValue}>{shipment.destination}</span></div></div>
          <div className={trackStyles.infoItem}><MapPin size={18} className={trackStyles.infoIcon} /><div><span className={trackStyles.infoLabel}>Current Location</span><span className={trackStyles.infoValue}>{shipment.currentLocation}</span></div></div>
          <div className={trackStyles.infoItem}><Calendar size={18} className={trackStyles.infoIcon} /><div><span className={trackStyles.infoLabel}>Estimated Delivery</span><span className={trackStyles.infoValue}>{shipment.estimatedDelivery ? new Date(shipment.estimatedDelivery).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'TBD'}</span></div></div>
          <div className={trackStyles.infoItem}><Weight size={18} className={trackStyles.infoIcon} /><div><span className={trackStyles.infoLabel}>Weight</span><span className={trackStyles.infoValue}>{shipment.weight} kg</span></div></div>
          <div className={trackStyles.infoItem}><User size={18} className={trackStyles.infoIcon} /><div><span className={trackStyles.infoLabel}>Receiver</span><span className={trackStyles.infoValue}>{shipment.receiver?.name}</span></div></div>
        </div>
      </div>

      <div className={trackStyles.bottomGrid}>
        <div className={trackStyles.timelineCard}>
          <h3 className={trackStyles.cardTitle}>Shipment Timeline</h3>
          <ShipmentTimeline history={shipment.trackingHistory || []} currentStatus={shipment.status} />
        </div>
        <div className={trackStyles.sideCol}>
          {shipment.images?.length > 0 && (
            <div className={trackStyles.imagesCard}>
              <h3 className={trackStyles.cardTitle}><ImageIcon size={16} /> Shipment Images</h3>
              <div className={trackStyles.imagesGrid}>
                {shipment.images.map((img, i) => <img key={i} src={img.url} alt='' className={trackStyles.shipmentImg} />)}
              </div>
            </div>
          )}
          {shipment.proofOfDelivery && (
            <div className={trackStyles.imagesCard}>
              <h3 className={trackStyles.cardTitle}>Proof of Delivery</h3>
              <img src={shipment.proofOfDelivery.url} alt='' className={trackStyles.shipmentImg} />
            </div>
          )}
          {shipment.notes && (
            <div className={trackStyles.notesCard}>
              <h3 className={trackStyles.cardTitle}>Remarks</h3>
              <p className={trackStyles.notesText}>{shipment.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
