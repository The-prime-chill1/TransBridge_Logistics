const User = require('../models/User')
const OTP = require('../models/OTP')
const AuditLog = require('../models/AuditLog')
const asyncHandler = require('../middleware/asyncHandler')
const otpService = require('../services/otpService')
const emailService = require('../services/emailService')
const smsService = require('../services/smsService')
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  setRefreshCookie,
  clearRefreshCookie,
} = require('../services/tokenService')

function logAudit(req, action, description, entity, entityId) {
  AuditLog.create({
    user: req.user?._id,
    action,
    entity,
    entityId,
    description,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  }).catch(err => console.error('Audit log error:', err.message))
}

// ─── REGISTER ───
// POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phone, country, password } = req.body

  const existingUser = await User.findOne({ $or: [{ email }, { phone }] })
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: existingUser.email === email ? 'Email already registered' : 'Phone number already registered',
    })
  }

  // Create user as unverified
  const user = await User.create({
    firstName, lastName, email, phone, country, password,
    isVerified: false,
  })

  // Generate and send OTP (4-digit, registration)
  await otpService.generateAndSend({
    identifier: email,
    email,
    phone,
    type: 'registration',
    metadata: { userId: user._id.toString() },
  })

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please verify your account using the code sent to your email and phone.',
    email,
    phone,
  })
})

// ─── VERIFY OTP (registration / password-reset) ───
// POST /api/auth/verify-otp
exports.verifyOTP = asyncHandler(async (req, res) => {
  const { email, phone, identifier, otp, type } = req.body
  const lookupIdentifier = identifier || email || phone

  if (!lookupIdentifier || !otp || !type) {
    return res.status(400).json({ success: false, message: 'Missing required fields' })
  }

  const result = await otpService.verify({ identifier: lookupIdentifier, type, code: otp })

  if (!result.valid) {
    return res.status(400).json({ success: false, message: result.message })
  }

  if (type === 'registration') {
    const userId = result.metadata?.userId
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    user.isVerified = true
    await user.save()

    const accessToken = generateAccessToken(user._id)
    const refreshToken = generateRefreshToken(user._id)
    user.refreshTokens.push(refreshToken)
    await user.save()
    setRefreshCookie(res, refreshToken)

    logAudit(req, 'user.register.verified', 'User verified registration OTP', 'User', user._id)

    return res.json({
      success: true,
      message: 'Account verified successfully',
      token: accessToken,
      user,
    })
  }

  if (type === 'password-reset' || type === 'change-password') {
    // Issue a short-lived reset token tied to this OTP verification
    const resetToken = result.otpDoc._id.toString()
    return res.json({
      success: true,
      message: 'Code verified. You may now reset your password.',
      resetToken,
    })
  }

  res.json({ success: true, message: 'Verified successfully' })
})

// ─── RESEND OTP ───
// POST /api/auth/resend-otp
exports.resendOTP = asyncHandler(async (req, res) => {
  const { email, phone, identifier, type } = req.body
  const lookupIdentifier = identifier || email || phone

  let targetEmail = email
  let targetPhone = phone
  let metadata = {}

  if (type === 'registration') {
    const user = await User.findOne({ $or: [{ email: lookupIdentifier }, { phone: lookupIdentifier }] })
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    targetEmail = user.email
    targetPhone = user.phone
    metadata = { userId: user._id.toString() }
  } else {
    const user = await User.findOne({ $or: [{ email: lookupIdentifier }, { phone: lookupIdentifier }] })
    if (user) {
      targetEmail = user.email
      targetPhone = user.phone
      metadata = { userId: user._id.toString() }
    }
  }

  await otpService.generateAndSend({
    identifier: lookupIdentifier,
    email: targetEmail,
    phone: targetPhone,
    type: type || 'registration',
    metadata,
  })

  res.json({ success: true, message: 'A new verification code has been sent' })
})

// ─── LOGIN ───
// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body

  const user = await User.findOne({
    $or: [{ email: identifier.toLowerCase() }, { phone: identifier }],
  }).select('+password')

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' })
  }

  if (user.isLocked()) {
    return res.status(423).json({ success: false, message: 'Account temporarily locked due to multiple failed attempts. Try again later.' })
  }

  const isMatch = await user.comparePassword(password)

  if (!isMatch) {
    user.loginAttempts += 1
    if (user.loginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 15 * 60 * 1000) // lock 15 min
    }
    await user.save()
    return res.status(401).json({ success: false, message: 'Invalid credentials' })
  }

  if (!user.isVerified) {
    return res.status(403).json({ success: false, message: 'Please verify your account first' })
  }

  if (!user.isActive) {
    return res.status(403).json({ success: false, message: 'Your account has been deactivated. Contact support.' })
  }

  // Reset login attempts on success
  user.loginAttempts = 0
  user.lockUntil = undefined
  user.lastLogin = new Date()

  const accessToken = generateAccessToken(user._id)
  const refreshToken = generateRefreshToken(user._id)
  user.refreshTokens = [...(user.refreshTokens || []).slice(-4), refreshToken] // keep last 5 sessions
  await user.save()

  setRefreshCookie(res, refreshToken)
  logAudit(req, 'user.login', 'User logged in', 'User', user._id)

  res.json({ success: true, message: 'Login successful', token: accessToken, user })
})

// ─── REFRESH TOKEN ───
// POST /api/auth/refresh-token
exports.refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken
  if (!token) {
    return res.status(401).json({ success: false, message: 'No refresh token provided' })
  }

  try {
    const decoded = verifyRefreshToken(token)
    const user = await User.findById(decoded.id)

    if (!user || !user.refreshTokens.includes(token)) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' })
    }

    const newAccessToken = generateAccessToken(user._id)
    res.json({ success: true, token: newAccessToken })
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' })
  }
})

// ─── LOGOUT ───
// POST /api/auth/logout
exports.logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken
  if (token && req.user) {
    req.user.refreshTokens = req.user.refreshTokens.filter(t => t !== token)
    await req.user.save()
  }
  clearRefreshCookie(res)
  res.json({ success: true, message: 'Logged out successfully' })
})

// ─── GET ME ───
// GET /api/auth/me
exports.getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user })
})

// ─── FORGOT PASSWORD ───
// POST /api/auth/forgot-password
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { identifier } = req.body

  const user = await User.findOne({
    $or: [{ email: identifier.toLowerCase() }, { phone: identifier }],
  })

  // Always respond success to prevent user enumeration
  if (!user) {
    return res.json({ success: true, message: 'If an account exists, a reset code has been sent.' })
  }

  await otpService.generateAndSend({
    identifier,
    email: user.email,
    phone: user.phone,
    type: 'password-reset',
    metadata: { userId: user._id.toString() },
  })

  res.json({ success: true, message: 'Reset code sent to your email and phone' })
})

// ─── RESET PASSWORD ───
// POST /api/auth/reset-password
exports.resetPassword = asyncHandler(async (req, res) => {
  const { email, phone, identifier, resetToken, newPassword } = req.body
  const lookupIdentifier = identifier || email || phone

  // Verify the reset token corresponds to a verified OTP
  const otp = await OTP.findById(resetToken)
  if (!otp || !otp.verified || otp.type !== 'password-reset' || otp.identifier !== lookupIdentifier) {
    return res.status(400).json({ success: false, message: 'Invalid or expired reset session. Please start over.' })
  }

  const userId = otp.metadata?.userId
  const user = await User.findById(userId)
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' })
  }

  user.password = newPassword
  user.refreshTokens = [] // invalidate all sessions
  await user.save()
  await otp.deleteOne()

  smsService.sendSecurityAlert(user.phone, 'Password reset').catch(() => {})
  logAudit(req, 'user.password.reset', 'Password reset via OTP', 'User', user._id)

  res.json({ success: true, message: 'Password reset successfully' })
})

// ─── CHANGE PASSWORD (logged in) ───
// PUT /api/auth/change-password
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, otp, step } = req.body
  const user = await User.findById(req.user._id).select('+password')

  if (step === 'request-otp') {
    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' })
    }

    await otpService.generateAndSend({
      identifier: user.email,
      email: user.email,
      phone: user.phone,
      type: 'change-password',
      metadata: { userId: user._id.toString() },
    })

    return res.json({ success: true, message: 'Verification code sent to your email and phone' })
  }

  if (step === 'confirm') {
    const result = await otpService.verify({ identifier: user.email, type: 'change-password', code: otp })
    if (!result.valid) {
      return res.status(400).json({ success: false, message: result.message })
    }

    user.password = newPassword
    user.refreshTokens = []
    await user.save()

    smsService.sendSecurityAlert(user.phone, 'Password change').catch(() => {})
    logAudit(req, 'user.password.change', 'Password changed by user', 'User', user._id)

    return res.json({ success: true, message: 'Password changed successfully. Please log in again.' })
  }

  res.status(400).json({ success: false, message: 'Invalid step parameter' })
})
