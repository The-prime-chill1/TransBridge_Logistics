const mongoose = require('mongoose')

const quoteSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional for guest quotes
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },

  serviceType: {
    type: String,
    enum: ['Air Freight', 'Sea Freight', 'Door-to-Door Delivery', 'Import & Export', 'Customs Clearance', 'Commercial Cargo', 'Warehousing', 'Package Consolidation'],
    required: true,
  },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  weight: Number,
  packageType: String,
  description: String,

  status: { type: String, enum: ['Pending', 'Quoted', 'Accepted', 'Declined', 'Expired'], default: 'Pending' },
  quotedPrice: Number,
  currency: { type: String, default: 'GBP' },
  adminResponse: String,
  respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  respondedAt: Date,
}, { timestamps: true })

quoteSchema.index({ customer: 1, createdAt: -1 })
quoteSchema.index({ status: 1 })

module.exports = mongoose.model('Quote', quoteSchema)
