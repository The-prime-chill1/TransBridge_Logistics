const mongoose = require('mongoose')

const auditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true }, // e.g. 'shipment.create', 'user.login', 'shipment.delete'
  entity: { type: String }, // e.g. 'Shipment', 'User'
  entityId: { type: mongoose.Schema.Types.ObjectId },
  description: String,
  ipAddress: String,
  userAgent: String,
  metadata: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true })

auditLogSchema.index({ user: 1, createdAt: -1 })
auditLogSchema.index({ action: 1 })

module.exports = mongoose.model('AuditLog', auditLogSchema)
