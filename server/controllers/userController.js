const User = require('../models/User')
const Shipment = require('../models/Shipment')
const AuditLog = require('../models/AuditLog')
const asyncHandler = require('../middleware/asyncHandler')
const uploadService = require('../services/uploadService')

function logAudit(req, action, description, entity, entityId) {
  AuditLog.create({
    user: req.user?._id, action, entity, entityId, description,
    ipAddress: req.ip, userAgent: req.headers['user-agent'],
  }).catch(err => console.error('Audit log error:', err.message))
}

// GET /api/users/profile
exports.getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user })
})

// PUT /api/users/profile
exports.updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, country } = req.body
  const user = await User.findById(req.user._id)

  if (firstName) user.firstName = firstName
  if (lastName) user.lastName = lastName
  if (country) user.country = country

  await user.save()
  res.json({ success: true, message: 'Profile updated successfully', user })
})

// POST /api/users/avatar
exports.uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' })
  }

  const user = await User.findById(req.user._id)

  if (user.avatar?.publicId) {
    await uploadService.deleteFile(user.avatar.publicId)
  }

  const uploaded = await uploadService.uploadBuffer(req.file.buffer, 'transbridge/avatars')
  user.avatar = uploaded
  await user.save()

  res.json({ success: true, message: 'Avatar updated successfully', user })
})

// ─── ADDRESSES ───
// POST /api/users/addresses
exports.addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  if (req.body.isDefault) {
    user.addresses.forEach(a => { a.isDefault = false })
  }
  user.addresses.push(req.body)
  await user.save()
  res.status(201).json({ success: true, message: 'Address added', addresses: user.addresses })
})

// PUT /api/users/addresses/:addressId
exports.updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  const address = user.addresses.id(req.params.addressId)
  if (!address) return res.status(404).json({ success: false, message: 'Address not found' })

  if (req.body.isDefault) user.addresses.forEach(a => { a.isDefault = false })
  Object.assign(address, req.body)
  await user.save()
  res.json({ success: true, message: 'Address updated', addresses: user.addresses })
})

// DELETE /api/users/addresses/:addressId
exports.deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.addressId)
  await user.save()
  res.json({ success: true, message: 'Address deleted', addresses: user.addresses })
})

// ─── ADMIN: MANAGE USERS ───
// GET /api/users
exports.getAllUsers = asyncHandler(async (req, res) => {
  const { search, role, page = 1, limit = 20 } = req.query
  const query = {}
  if (role) query.role = role
  if (search) {
    query.$or = [
      { firstName: new RegExp(search, 'i') },
      { lastName: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { phone: new RegExp(search, 'i') },
    ]
  }

  const skip = (parseInt(page) - 1) * parseInt(limit)
  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    User.countDocuments(query),
  ])

  // Attach shipment count for each user
  const usersWithStats = await Promise.all(users.map(async (u) => {
    const shipmentCount = await Shipment.countDocuments({ customer: u._id, isArchived: false })
    return { ...u.toJSON(), shipmentCount }
  }))

  res.json({ success: true, users: usersWithStats, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } })
})

// GET /api/users/:id
exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) return res.status(404).json({ success: false, message: 'User not found' })

  const shipments = await Shipment.find({ customer: user._id, isArchived: false }).sort({ createdAt: -1 }).limit(10)
  res.json({ success: true, user, recentShipments: shipments })
})

// PUT /api/users/:id
exports.updateUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, role, permissions, isActive } = req.body
  const user = await User.findById(req.params.id)
  if (!user) return res.status(404).json({ success: false, message: 'User not found' })

  if (firstName) user.firstName = firstName
  if (lastName) user.lastName = lastName
  if (role && req.user.role === 'admin') user.role = role
  if (permissions && req.user.role === 'admin') user.permissions = permissions
  if (isActive !== undefined) user.isActive = isActive

  await user.save()
  logAudit(req, 'user.update', `Updated user ${user.email}`, 'User', user._id)

  res.json({ success: true, message: 'User updated successfully', user })
})

// PUT /api/users/:id/deactivate
exports.deactivateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) return res.status(404).json({ success: false, message: 'User not found' })

  user.isActive = !user.isActive
  await user.save()

  logAudit(req, 'user.toggle-active', `${user.isActive ? 'Activated' : 'Deactivated'} user ${user.email}`, 'User', user._id)
  res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`, user })
})
