const Shipment = require('../models/Shipment')
const User = require('../models/User')
const Notification = require('../models/Notification')
const AuditLog = require('../models/AuditLog')
const asyncHandler = require('../middleware/asyncHandler')
const emailService = require('../services/emailService')
const smsService = require('../services/smsService')
const uploadService = require('../services/uploadService')

function logAudit(req, action, description, entity, entityId) {
  AuditLog.create({
    user: req.user?._id,
    action, entity, entityId, description,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  }).catch(err => console.error('Audit log error:', err.message))
}

async function notifyAndEmit(req, userId, { type, title, message, relatedId, relatedModel }) {
  const notification = await Notification.create({ user: userId, type, title, message, relatedId, relatedModel })
  const io = req.app.get('io')
  io?.to(`user:${userId}`).emit('notification:new', notification)
  return notification
}

// ─── TRACK (Public) ───
// GET /api/shipments/track/:trackingNumber
exports.trackShipment = asyncHandler(async (req, res) => {
  const trackingNumber = req.params.trackingNumber.toUpperCase().trim()

  const shipment = await Shipment.findOne({ trackingNumber, isArchived: false })
    .populate('customer', 'firstName lastName')
    .select('-internalNotes')

  if (!shipment) {
    return res.status(404).json({ success: false, message: 'No shipment found with this tracking number' })
  }

  res.json({ success: true, shipment })
})

// ─── GET ALL (Admin) ───
// GET /api/shipments
exports.getAllShipments = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 20, archived } = req.query
  const query = {}

  if (status) query.status = status
  if (archived !== undefined) query.isArchived = archived === 'true'
  else query.isArchived = false

  if (search) {
    query.$or = [
      { trackingNumber: new RegExp(search, 'i') },
      { 'receiver.name': new RegExp(search, 'i') },
      { origin: new RegExp(search, 'i') },
      { destination: new RegExp(search, 'i') },
    ]
  }

  const skip = (parseInt(page) - 1) * parseInt(limit)

  const [shipments, total] = await Promise.all([
    Shipment.find(query)
      .populate('customer', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Shipment.countDocuments(query),
  ])

  res.json({
    success: true,
    shipments,
    pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
  })
})

// ─── GET MY SHIPMENTS (Customer) ───
// GET /api/shipments/my
exports.getMyShipments = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query
  const query = { customer: req.user._id, isArchived: false }
  if (status) query.status = status

  const skip = (parseInt(page) - 1) * parseInt(limit)

  const [shipments, total] = await Promise.all([
    Shipment.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    Shipment.countDocuments(query),
  ])

  res.json({ success: true, shipments, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } })
})

// ─── GET ONE ───
// GET /api/shipments/:id
exports.getShipment = asyncHandler(async (req, res) => {
  const shipment = await Shipment.findById(req.params.id).populate('customer', 'firstName lastName email phone')

  if (!shipment) {
    return res.status(404).json({ success: false, message: 'Shipment not found' })
  }

  // Customers can only view their own shipments
  if (req.user.role === 'customer' && shipment.customer._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Access denied' })
  }

  res.json({ success: true, shipment })
})

// ─── CREATE (Admin) ───
// POST /api/shipments
exports.createShipment = asyncHandler(async (req, res) => {
  const {
    customer, receiver, origin, destination, weight, dimensions,
    packageType, courier, estimatedDelivery, currentLocation, notes, price, currency,
  } = req.body

  const customerUser = await User.findById(customer)
  if (!customerUser) {
    return res.status(404).json({ success: false, message: 'Customer not found' })
  }

  const trackingNumber = await Shipment.generateTrackingNumber()

  const shipment = await Shipment.create({
    trackingNumber,
    customer,
    receiver,
    origin,
    destination,
    currentLocation: currentLocation || origin,
    weight,
    dimensions,
    packageType,
    courier,
    estimatedDelivery,
    notes,
    price,
    currency,
    status: 'Shipment Created',
    trackingHistory: [{
      status: 'Shipment Created',
      location: origin,
      timestamp: new Date(),
      updatedBy: req.user._id,
    }],
    createdBy: req.user._id,
  })

  // Notify customer
  await notifyAndEmit(req, customer, {
    type: 'shipment_created',
    title: 'Shipment Created',
    message: `Your shipment ${trackingNumber} has been created and is being processed.`,
    relatedId: shipment._id,
    relatedModel: 'Shipment',
  })

  emailService.sendShipmentCreated(customerUser.email, shipment).catch(() => {})
  smsService.sendShipmentUpdate(customerUser.phone, shipment).catch(() => {})

  logAudit(req, 'shipment.create', `Created shipment ${trackingNumber}`, 'Shipment', shipment._id)

  res.status(201).json({ success: true, message: 'Shipment created successfully', shipment })
})

// ─── UPDATE (Admin) ───
// PUT /api/shipments/:id
exports.updateShipment = asyncHandler(async (req, res) => {
  const shipment = await Shipment.findById(req.params.id).populate('customer')
  if (!shipment) {
    return res.status(404).json({ success: false, message: 'Shipment not found' })
  }

  const {
    status, currentLocation, estimatedDelivery, remarks,
    receiver, weight, dimensions, packageType, courier, notes, internalNotes, price, paymentStatus,
  } = req.body

  const statusChanged = status && status !== shipment.status

  // Update fields
  if (receiver) shipment.receiver = { ...shipment.receiver.toObject(), ...receiver }
  if (weight !== undefined) shipment.weight = weight
  if (dimensions) shipment.dimensions = dimensions
  if (packageType) shipment.packageType = packageType
  if (courier) shipment.courier = courier
  if (estimatedDelivery) shipment.estimatedDelivery = estimatedDelivery
  if (currentLocation) shipment.currentLocation = currentLocation
  if (notes !== undefined) shipment.notes = notes
  if (internalNotes !== undefined) shipment.internalNotes = internalNotes
  if (price !== undefined) shipment.price = price
  if (paymentStatus) shipment.paymentStatus = paymentStatus

  if (statusChanged) {
    shipment.status = status
    shipment.trackingHistory.push({
      status,
      location: currentLocation || shipment.currentLocation,
      remarks,
      timestamp: new Date(),
      updatedBy: req.user._id,
    })

    if (status === 'Delivered') {
      shipment.actualDeliveryDate = new Date()
    }
  }

  await shipment.save()

  if (statusChanged) {
    const customerUser = shipment.customer

    await notifyAndEmit(req, customerUser._id, {
      type: status === 'Delivered' ? 'shipment_delivered' : 'shipment_updated',
      title: status === 'Delivered' ? 'Shipment Delivered!' : 'Shipment Status Updated',
      message: `Your shipment ${shipment.trackingNumber} is now "${status}".`,
      relatedId: shipment._id,
      relatedModel: 'Shipment',
    })

    if (status === 'Delivered') {
      emailService.sendShipmentDelivered(customerUser.email, shipment).catch(() => {})
      smsService.sendDeliveryNotification(customerUser.phone, shipment).catch(() => {})
    } else {
      emailService.sendShipmentUpdated(customerUser.email, shipment).catch(() => {})
      smsService.sendShipmentUpdate(customerUser.phone, shipment).catch(() => {})
    }

    // Real-time push to customer's dashboard
    const io = req.app.get('io')
    io?.to(`user:${customerUser._id}`).emit('shipment:updated', shipment)
    io?.to('admin-room').emit('shipment:updated', shipment)
  }

  logAudit(req, 'shipment.update', `Updated shipment ${shipment.trackingNumber}`, 'Shipment', shipment._id)

  res.json({ success: true, message: 'Shipment updated successfully', shipment })
})

// ─── UPLOAD IMAGES ───
// POST /api/shipments/:id/images
exports.uploadShipmentImages = asyncHandler(async (req, res) => {
  const shipment = await Shipment.findById(req.params.id)
  if (!shipment) {
    return res.status(404).json({ success: false, message: 'Shipment not found' })
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No files uploaded' })
  }

  const { imageType = 'images' } = req.body // 'images' | 'documents' | 'proofOfDelivery'
  const uploaded = await uploadService.uploadMultiple(req.files, `transbridge/shipments/${shipment.trackingNumber}`)

  if (imageType === 'proofOfDelivery') {
    shipment.proofOfDelivery = uploaded[0]
  } else if (imageType === 'documents') {
    shipment.documents.push(...uploaded)
  } else {
    shipment.images.push(...uploaded)
  }

  await shipment.save()
  logAudit(req, 'shipment.images.upload', `Uploaded ${uploaded.length} file(s) to ${shipment.trackingNumber}`, 'Shipment', shipment._id)

  res.json({ success: true, message: 'Files uploaded successfully', shipment })
})

// ─── DELETE / ARCHIVE ───
// DELETE /api/shipments/:id
exports.deleteShipment = asyncHandler(async (req, res) => {
  const shipment = await Shipment.findById(req.params.id)
  if (!shipment) {
    return res.status(404).json({ success: false, message: 'Shipment not found' })
  }

  shipment.isArchived = true
  await shipment.save()

  logAudit(req, 'shipment.archive', `Archived shipment ${shipment.trackingNumber}`, 'Shipment', shipment._id)

  res.json({ success: true, message: 'Shipment archived successfully' })
})

// ─── RESTORE ───
// PUT /api/shipments/:id/restore
exports.restoreShipment = asyncHandler(async (req, res) => {
  const shipment = await Shipment.findById(req.params.id)
  if (!shipment) {
    return res.status(404).json({ success: false, message: 'Shipment not found' })
  }

  shipment.isArchived = false
  await shipment.save()

  res.json({ success: true, message: 'Shipment restored successfully', shipment })
})
