const Notification = require('../models/Notification')
const asyncHandler = require('../middleware/asyncHandler')

// GET /api/notifications
exports.getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly } = req.query
  const query = { user: req.user._id }
  if (unreadOnly === 'true') query.isRead = false

  const skip = (parseInt(page) - 1) * parseInt(limit)
  const [notifications, total] = await Promise.all([
    Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    Notification.countDocuments(query),
  ])

  res.json({ success: true, notifications, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } })
})

// GET /api/notifications/unread-count
exports.getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({ user: req.user._id, isRead: false })
  res.json({ success: true, count })
})

// PUT /api/notifications/:id/read
exports.markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true, readAt: new Date() },
    { new: true }
  )
  if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' })
  res.json({ success: true, notification })
})

// PUT /api/notifications/read-all
exports.markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true, readAt: new Date() })
  res.json({ success: true, message: 'All notifications marked as read' })
})
