const SupportTicket = require('../models/SupportTicket')
const Notification = require('../models/Notification')
const asyncHandler = require('../middleware/asyncHandler')
const emailService = require('../services/emailService')

// POST /api/support
exports.createTicket = asyncHandler(async (req, res) => {
  const { subject, category, message, relatedShipment, priority } = req.body

  const ticket = await SupportTicket.create({
    customer: req.user._id,
    subject,
    category,
    relatedShipment,
    priority,
    messages: [{ sender: req.user._id, senderRole: 'customer', message }],
  })

  const io = req.app.get('io')
  io?.to('admin-room').emit('support:new', ticket)

  res.status(201).json({ success: true, message: 'Support ticket created successfully', ticket })
})

// GET /api/support (admin)
exports.getAllTickets = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query
  const query = {}
  if (status) query.status = status

  const skip = (parseInt(page) - 1) * parseInt(limit)
  const [tickets, total] = await Promise.all([
    SupportTicket.find(query).populate('customer', 'firstName lastName email').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    SupportTicket.countDocuments(query),
  ])

  res.json({ success: true, tickets, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } })
})

// GET /api/support/my
exports.getMyTickets = asyncHandler(async (req, res) => {
  const tickets = await SupportTicket.find({ customer: req.user._id }).sort({ createdAt: -1 })
  res.json({ success: true, tickets })
})

// GET /api/support/:id
exports.getTicket = asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.findById(req.params.id)
    .populate('customer', 'firstName lastName email')
    .populate('messages.sender', 'firstName lastName role')

  if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' })

  if (req.user.role === 'customer' && ticket.customer._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Access denied' })
  }

  res.json({ success: true, ticket })
})

// POST /api/support/:id/reply
exports.replyToTicket = asyncHandler(async (req, res) => {
  const { message } = req.body
  const ticket = await SupportTicket.findById(req.params.id).populate('customer', 'email')

  if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' })

  if (req.user.role === 'customer' && ticket.customer._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Access denied' })
  }

  ticket.messages.push({ sender: req.user._id, senderRole: req.user.role, message })
  if (req.user.role !== 'customer' && ticket.status === 'Open') ticket.status = 'In Progress'
  await ticket.save()

  const io = req.app.get('io')

  if (req.user.role === 'customer') {
    io?.to('admin-room').emit('support:reply', ticket)
  } else {
    await Notification.create({
      user: ticket.customer._id,
      type: 'support_reply',
      title: 'New Reply on Your Ticket',
      message: `Support replied to your ticket: ${ticket.subject}`,
      relatedId: ticket._id,
      relatedModel: 'SupportTicket',
    })
    io?.to(`user:${ticket.customer._id}`).emit('notification:new', { type: 'support_reply' })
    emailService.sendSupportReply(ticket.customer.email, ticket, message).catch(() => {})
  }

  res.json({ success: true, message: 'Reply added successfully', ticket })
})

// PUT /api/support/:id/close
exports.closeTicket = asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.findById(req.params.id)
  if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' })

  ticket.status = 'Closed'
  await ticket.save()

  res.json({ success: true, message: 'Ticket closed', ticket })
})
