const jwt = require('jsonwebtoken')
const User = require('../models/User')

function initSocket(io) {
  // Authenticate socket connections via JWT
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token
      if (!token) return next(new Error('Authentication required'))

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decoded.id)
      if (!user) return next(new Error('User not found'))

      socket.user = user
      next()
    } catch (err) {
      next(new Error('Invalid authentication token'))
    }
  })

  io.on('connection', (socket) => {
    const user = socket.user
    console.log(`Socket connected: ${user.email} (${user.role})`)

    // Join personal room for targeted notifications
    socket.join(`user:${user._id}`)

    // Admins/staff join shared admin room for global alerts
    if (user.role === 'admin' || user.role === 'staff') {
      socket.join('admin-room')
    }

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${user.email}`)
    })

    // Allow customers to subscribe to a specific shipment's live updates (e.g. while viewing tracking page)
    socket.on('shipment:subscribe', (trackingNumber) => {
      socket.join(`shipment:${trackingNumber}`)
    })

    socket.on('shipment:unsubscribe', (trackingNumber) => {
      socket.leave(`shipment:${trackingNumber}`)
    })
  })
}

module.exports = initSocket
