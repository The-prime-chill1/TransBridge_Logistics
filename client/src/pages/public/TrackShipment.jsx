import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package, Search, MapPin, Calendar, Weight, User,
  AlertCircle, CheckCircle2, Image as ImageIcon, FileText
} from 'lucide-react'
import { shipmentAPI } from '../../services/api'
import ShipmentTimeline from '../../components/ui/ShipmentTimeline'
import styles from './TrackShipment.module.css'

export default function TrackShipment() {
  const { trackingNumber: paramTrackingNumber } = useParams()
  const navigate = useNavigate()
  const [trackingNumber, setTrackingNumber] = useState(paramTrackingNumber || '')
  const [shipment, setShipment] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    document.title = 'Track Shipment — TransBridge Logistics'
    if (paramTrackingNumber) handleTrack(paramTrackingNumber)
  }, [paramTrackingNumber])

  const handleTrack = async (num) => {
    const trackVal = num || trackingNumber
    if (!trackVal.trim()) {
      setError('Please enter a tracking number')
      return
    }
    setLoading(true)
    setError('')
    setSearched(true)
    try {
      const res = await shipmentAPI.track(trackVal.trim())
      setShipment(res.data.shipment)
      navigate(`/track/${trackVal.trim()}`, { replace: true })
    } catch (err) {
      setShipment(null)
      setError(err.response?.data?.message || 'Shipment not found. Please check your tracking number.')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = (e) => {
    e.preventDefault()
    handleTrack()
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className='container'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={styles.headerContent}
          >
            <span className='section-eyebrow'>Real-Time Tracking</span>
            <h1 className={styles.title}>Track Your Shipment</h1>
            <p className={styles.subtitle}>Enter your tracking number to see real-time status and delivery updates.</p>

            <form onSubmit={onSubmit} className={styles.searchBar}>
              <Package size={20} className={styles.searchIcon} />
              <input
                type='text'
                placeholder='e.g. TB-2026-000001'
                value={trackingNumber}
                onChange={e => setTrackingNumber(e.target.value)}
              />
              <button type='submit' className='btn btn-primary' disabled={loading}>
                {loading ? <span className='loading-spinner' /> : <><Search size={16} /> Track</>}
              </button>
            </form>
          </motion.div>
        </div>
      </div>

      <div className='container'>
        <AnimatePresence mode='wait'>
          {error && (
            <motion.div
              key='error'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={styles.errorBox}
            >
              <AlertCircle size={20} />
              <span>{error}</span>
            </motion.div>
          )}

          {shipment && (
            <motion.div
              key='result'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className={styles.resultWrap}
            >
              {/* Status Card */}
              <div className={styles.statusCard}>
                <div className={styles.statusHeader}>
                  <div>
                    <span className={styles.trackingLabel}>Tracking Number</span>
                    <h2 className={styles.trackingNum}>{shipment.trackingNumber}</h2>
                  </div>
                  <div className={`badge badge-warning ${styles.statusBadge}`}>
                    <CheckCircle2 size={14} /> {shipment.status}
                  </div>
                </div>

                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <MapPin size={18} className={styles.infoIcon} />
                    <div>
                      <span className={styles.infoLabel}>Origin</span>
                      <span className={styles.infoValue}>{shipment.origin}</span>
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <MapPin size={18} className={styles.infoIcon} />
                    <div>
                      <span className={styles.infoLabel}>Destination</span>
                      <span className={styles.infoValue}>{shipment.destination}</span>
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <MapPin size={18} className={styles.infoIcon} />
                    <div>
                      <span className={styles.infoLabel}>Current Location</span>
                      <span className={styles.infoValue}>{shipment.currentLocation}</span>
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <Calendar size={18} className={styles.infoIcon} />
                    <div>
                      <span className={styles.infoLabel}>Estimated Delivery</span>
                      <span className={styles.infoValue}>
                        {shipment.estimatedDelivery ? new Date(shipment.estimatedDelivery).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'TBD'}
                      </span>
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <Weight size={18} className={styles.infoIcon} />
                    <div>
                      <span className={styles.infoLabel}>Package Weight</span>
                      <span className={styles.infoValue}>{shipment.weight} kg</span>
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <User size={18} className={styles.infoIcon} />
                    <div>
                      <span className={styles.infoLabel}>Receiver</span>
                      <span className={styles.infoValue}>{shipment.receiver?.name}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.bottomGrid}>
                {/* Timeline */}
                <div className={styles.timelineCard}>
                  <h3 className={styles.cardTitle}>Shipment Timeline</h3>
                  <ShipmentTimeline history={shipment.trackingHistory || []} currentStatus={shipment.status} />
                </div>

                {/* Images / Proof */}
                <div className={styles.sideCol}>
                  {shipment.images?.length > 0 && (
                    <div className={styles.imagesCard}>
                      <h3 className={styles.cardTitle}><ImageIcon size={16} /> Shipment Images</h3>
                      <div className={styles.imagesGrid}>
                        {shipment.images.map((img, i) => (
                          <img key={i} src={img.url} alt={`Shipment ${i + 1}`} className={styles.shipmentImg} />
                        ))}
                      </div>
                    </div>
                  )}
                  {shipment.proofOfDelivery && (
                    <div className={styles.imagesCard}>
                      <h3 className={styles.cardTitle}><FileText size={16} /> Proof of Delivery</h3>
                      <img src={shipment.proofOfDelivery.url} alt='Proof of delivery' className={styles.shipmentImg} />
                    </div>
                  )}
                  {shipment.notes && (
                    <div className={styles.notesCard}>
                      <h3 className={styles.cardTitle}>Remarks</h3>
                      <p className={styles.notesText}>{shipment.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {!shipment && !error && searched === false && (
            <motion.div
              key='hint'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={styles.hintBox}
            >
              <Package size={40} className={styles.hintIcon} />
              <p>Enter your tracking number above to view your shipment's live status and full delivery timeline.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
