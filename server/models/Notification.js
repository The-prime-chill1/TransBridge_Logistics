const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['shipment_created', 'shipment_updated', 'shipment_delivered', 'quote_response', 'support_reply', 'security_alert', 'system'],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  relatedId: { type: mongoose.Schema.Types.ObjectId }, // shipment/quote/ticket id
  relatedModel: { type: String, enum: ['Shipment', 'Quote', 'SupportTicket'] },
  isRead: { type: Boolean, default: false },
  readAt: Date,
}, { timestamps: true })

notificationSchema.index({ user: 1, createdAt: -1 })
notificationSchema.index({ user: 1, isRead: 1 })

module.exports = mongoose.model('Notification', notificationSchema)
