require('dotenv').config()
const express = require('express')
const http = require('http')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const { Server } = require('socket.io')

const connectDB = require('./config/db')
const { apiLimiter } = require('./middleware/rateLimiter')
const errorHandler = require('./middleware/errorHandler')
const initSocket = require('./sockets')

const authRoutes = require('./routes/authRoutes')
const shipmentRoutes = require('./routes/shipmentRoutes')
const userRoutes = require('./routes/userRoutes')
const quoteRoutes = require('./routes/quoteRoutes')
const notificationRoutes = require('./routes/notificationRoutes')
const supportRoutes = require('./routes/supportRoutes')
const analyticsRoutes = require('./routes/analyticsRoutes')

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
})

// Make io accessible in controllers via req.app.get('io')
app.set('io', io)

// ─── Security Middleware ───
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use('/api', apiLimiter)

// ─── Routes ───
app.use('/api/auth', authRoutes)
app.use('/api/shipments', shipmentRoutes)
app.use('/api/users', userRoutes)
app.use('/api/quotes', quoteRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/support', supportRoutes)
app.use('/api/analytics', analyticsRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'TransBridge Logistics API', timestamp: new Date().toISOString() })
})

// ─── 404 Handler ───
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' })
})

// ─── Error Handler ───
app.use(errorHandler)

// ─── Socket.io ───
initSocket(io)

// ─── Start Server ───
const PORT = process.env.PORT || 5000

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`TransBridge Logistics API running on port ${PORT}`)
  })
})

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err)
})

module.exports = { app, server, io }
