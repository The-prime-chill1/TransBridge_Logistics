const mongoose = require('mongoose')

const SHIPMENT_STATUSES = [
  'Shipment Created',
  'Picked Up',
  'Warehouse',
  'Departed UK',
  'In Transit',
  'Customs Clearance',
  'Arrived Nigeria',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
  'On Hold',
]

const trackingHistorySchema = new mongoose.Schema({
  status: { type: String, enum: SHIPMENT_STATUSES, required: true },
  location: String,
  remarks: String,
  timestamp: { type: Date, default: Date.now },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { _id: false })

const imageSchema = new mongoose.Schema({
  url: String,
  publicId: String,
  caption: String,
  uploadedAt: { type: Date, default: Date.now },
}, { _id: false })

const shipmentSchema = new mongoose.Schema({
  trackingNumber: { type: String, required: true, unique: true, uppercase: true, index: true },

  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  receiver: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,
    address: String,
  },

  origin: { type: String, required: true },
  destination: { type: String, required: true },
  currentLocation: { type: String, default: '' },

  weight: { type: Number, required: true }, // kg
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: { type: String, default: 'cm' },
  },

  packageType: {
    type: String,
    enum: ['Document', 'Parcel', 'Pallet', 'Container', 'Personal Effects', 'Commercial Goods'],
    default: 'Parcel',
  },
  courier: { type: String, enum: ['Air Freight', 'Sea Freight'], default: 'Air Freight' },

  status: { type: String, enum: SHIPMENT_STATUSES, default: 'Shipment Created' },
  trackingHistory: [trackingHistorySchema],

  estimatedDelivery: Date,
  actualDeliveryDate: Date,

  notes: String,
  internalNotes: String, // admin-only

  images: [imageSchema],
  documents: [imageSchema],
  proofOfDelivery: imageSchema,

  price: { type: Number, default: 0 },
  currency: { type: String, default: 'GBP' },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Partial', 'Refunded'], default: 'Pending' },

  isArchived: { type: Boolean, default: false },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

shipmentSchema.index({ customer: 1, createdAt: -1 })
shipmentSchema.index({ status: 1 })
shipmentSchema.index({ isArchived: 1 })

shipmentSchema.statics.STATUSES = SHIPMENT_STATUSES

// Auto-generate tracking number: TB-YYYY-NNNNNN
shipmentSchema.statics.generateTrackingNumber = async function () {
  const year = new Date().getFullYear()
  let trackingNumber
  let exists = true
  let attempts = 0

  while (exists && attempts < 10) {
    const count = await this.countDocuments({
      trackingNumber: new RegExp(`^TB-${year}-`),
    })
    const sequence = String(count + 1 + attempts).padStart(6, '0')
    trackingNumber = `TB-${year}-${sequence}`
    exists = await this.exists({ trackingNumber })
    attempts++
  }

  if (exists) {
    // fallback to random suffix if collision persists
    trackingNumber = `TB-${year}-${Math.floor(100000 + Math.random() * 900000)}`
  }

  return trackingNumber
}

module.exports = mongoose.model('Shipment', shipmentSchema)
module.exports.SHIPMENT_STATUSES = SHIPMENT_STATUSES
