const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderRole: { type: String, enum: ['customer', 'admin', 'staff'] },
  message: { type: String, required: true },
  attachments: [{ url: String, publicId: String, fileName: String }],
}, { timestamps: true })

const supportTicketSchema = new mongoose.Schema({
  ticketNumber: { type: String, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  category: {
    type: String,
    enum: ['Shipment Issue', 'Billing', 'Account', 'General Inquiry', 'Complaint', 'Other'],
    default: 'General Inquiry',
  },
  relatedShipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipment' },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  status: { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Closed'], default: 'Open' },
  messages: [messageSchema],
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

supportTicketSchema.pre('save', async function (next) {
  if (this.isNew && !this.ticketNumber) {
    const count = await mongoose.model('SupportTicket').countDocuments()
    this.ticketNumber = `TKT-${String(count + 1).padStart(5, '0')}`
  }
  next()
})

supportTicketSchema.index({ customer: 1, createdAt: -1 })
supportTicketSchema.index({ status: 1 })

module.exports = mongoose.model('SupportTicket', supportTicketSchema)
