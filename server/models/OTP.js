const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const otpSchema = new mongoose.Schema({
  identifier: { type: String, required: true }, // email or phone used to look up
  email: String,
  phone: String,
  code: { type: String, required: true, select: false }, // hashed OTP
  type: {
    type: String,
    enum: ['registration', 'password-reset', 'change-password', 'login-2fa'],
    required: true,
  },
  attempts: { type: Number, default: 0 },
  maxAttempts: { type: Number, default: 5 },
  verified: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed }, // e.g. pending user data, userId
}, { timestamps: true })

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
otpSchema.index({ identifier: 1, type: 1 })

otpSchema.statics.hashCode = async function (code) {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(code, salt)
}

otpSchema.methods.compareCode = async function (candidateCode) {
  return bcrypt.compare(candidateCode, this.code)
}

otpSchema.statics.generateCode = function (length = 4) {
  const min = Math.pow(10, length - 1)
  const max = Math.pow(10, length) - 1
  return Math.floor(min + Math.random() * (max - min + 1)).toString()
}

module.exports = mongoose.model('OTP', otpSchema)
