const Quote = require('../models/Quote')
const Notification = require('../models/Notification')
const asyncHandler = require('../middleware/asyncHandler')
const emailService = require('../services/emailService')

// POST /api/quotes (public or authenticated)
exports.createQuote = asyncHandler(async (req, res) => {
  const { fullName, email, phone, serviceType, origin, destination, weight, packageType, description } = req.body

  const quote = await Quote.create({
    customer: req.user?._id,
    fullName, email, phone, serviceType, origin, destination, weight, packageType, description,
  })

  emailService.sendQuoteConfirmation(email, quote).catch(() => {})

  // Notify admins via socket
  const io = req.app.get('io')
  io?.to('admin-room').emit('quote:new', quote)

  res.status(201).json({ success: true, message: 'Quote request submitted successfully', quote })
})

// GET /api/quotes (admin)
exports.getAllQuotes = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query
  const query = {}
  if (status) query.status = status

  const skip = (parseInt(page) - 1) * parseInt(limit)
  const [quotes, total] = await Promise.all([
    Quote.find(query).populate('customer', 'firstName lastName email').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    Quote.countDocuments(query),
  ])

  res.json({ success: true, quotes, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } })
})

// GET /api/quotes/my (customer)
exports.getMyQuotes = asyncHandler(async (req, res) => {
  const quotes = await Quote.find({ customer: req.user._id }).sort({ createdAt: -1 })
  res.json({ success: true, quotes })
})

// GET /api/quotes/:id
exports.getQuote = asyncHandler(async (req, res) => {
  const quote = await Quote.findById(req.params.id).populate('customer', 'firstName lastName email')
  if (!quote) return res.status(404).json({ success: false, message: 'Quote not found' })
  res.json({ success: true, quote })
})

// PUT /api/quotes/:id (admin responds)
exports.updateQuote = asyncHandler(async (req, res) => {
  const { status, quotedPrice, currency, adminResponse } = req.body
  const quote = await Quote.findById(req.params.id)
  if (!quote) return res.status(404).json({ success: false, message: 'Quote not found' })

  if (status) quote.status = status
  if (quotedPrice !== undefined) quote.quotedPrice = quotedPrice
  if (currency) quote.currency = currency
  if (adminResponse) quote.adminResponse = adminResponse
  quote.respondedBy = req.user._id
  quote.respondedAt = new Date()

  await quote.save()

  if (quote.customer) {
    await Notification.create({
      user: quote.customer,
      type: 'quote_response',
      title: 'Quote Response Received',
      message: `Your quote request for ${quote.serviceType} has been ${quote.status.toLowerCase()}.`,
      relatedId: quote._id,
      relatedModel: 'Quote',
    })
    const io = req.app.get('io')
    io?.to(`user:${quote.customer}`).emit('notification:new', { type: 'quote_response' })
  }

  res.json({ success: true, message: 'Quote updated successfully', quote })
})
