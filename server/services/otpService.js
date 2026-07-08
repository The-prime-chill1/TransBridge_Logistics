const OTP = require('../models/OTP')
const emailService = require('./emailService')
const smsService = require('./smsService')

const OTP_CONFIG = {
  registration: { length: 4, expiryMinutes: 5, maxAttempts: 5 },
  'password-reset': { length: 5, expiryMinutes: 10, maxAttempts: 5 },
  'change-password': { length: 5, expiryMinutes: 10, maxAttempts: 5 },
  'login-2fa': { length: 4, expiryMinutes: 5, maxAttempts: 5 },
}

const otpService = {
  /**
   * Generates and sends an OTP via both email and SMS.
   * Invalidates any previous unverified OTPs of the same type for this identifier.
   */
  async generateAndSend({ identifier, email, phone, type, metadata = {} }) {
    const config = OTP_CONFIG[type] || OTP_CONFIG.registration

    // Invalidate previous OTPs for this identifier + type
    await OTP.deleteMany({ identifier, type, verified: false })

    const code = OTP.generateCode(config.length)
    const hashedCode = await OTP.hashCode(code)

    const otp = await OTP.create({
      identifier,
      email,
      phone,
      code: hashedCode,
      type,
      maxAttempts: config.maxAttempts,
      expiresAt: new Date(Date.now() + config.expiryMinutes * 60 * 1000),
      metadata,
    })

    // Send to BOTH channels simultaneously
    const results = await Promise.allSettled([
      email ? emailService.sendOTP(email, code, type) : Promise.resolve(false),
      phone ? smsService.sendOTP(phone, code, type) : Promise.resolve(false),
    ])

    const emailSent = results[0].status === 'fulfilled' && results[0].value
    const smsSent = results[1].status === 'fulfilled' && results[1].value

    return { otpId: otp._id, emailSent, smsSent }
  },

  /**
   * Verifies an OTP code against the stored hash, incrementing attempts on failure.
   */
  async verify({ identifier, type, code }) {
    const otp = await OTP.findOne({ identifier, type, verified: false }).select('+code').sort({ createdAt: -1 })

    if (!otp) {
      return { valid: false, message: 'No active verification code found. Please request a new one.' }
    }

    if (otp.expiresAt < new Date()) {
      await otp.deleteOne()
      return { valid: false, message: 'Verification code has expired. Please request a new one.' }
    }

    if (otp.attempts >= otp.maxAttempts) {
      await otp.deleteOne()
      return { valid: false, message: 'Too many failed attempts. Please request a new code.' }
    }

    const isMatch = await otp.compareCode(code)

    if (!isMatch) {
      otp.attempts += 1
      await otp.save()
      const remaining = otp.maxAttempts - otp.attempts
      return { valid: false, message: `Invalid code. ${remaining} attempt(s) remaining.` }
    }

    otp.verified = true
    await otp.save()

    return { valid: true, metadata: otp.metadata, otpDoc: otp }
  },
}

module.exports = otpService
