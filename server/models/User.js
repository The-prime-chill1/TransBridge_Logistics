const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const addressSchema = new mongoose.Schema({
  label: { type: String, default: 'Home' },
  fullName: String,
  street: String,
  city: String,
  state: String,
  postalCode: String,
  country: String,
  phone: String,
  isDefault: { type: Boolean, default: false },
}, { timestamps: true })

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  country: { type: String, required: true },
  password: { type: String, required: true, minlength: 8, select: false },
  avatar: {
    url: String,
    publicId: String,
  },
  role: {
    type: String,
    enum: ['customer', 'admin', 'staff'],
    default: 'customer',
  },
  permissions: [{ type: String }], // for staff role
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  addresses: [addressSchema],
  refreshTokens: [{ type: String }],
  lastLogin: Date,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
}, { timestamps: true })

userSchema.index({ email: 1 })
userSchema.index({ phone: 1 })

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

userSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now()
}

userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`
})

userSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.password
    delete ret.refreshTokens
    delete ret.__v
    return ret
  },
})

module.exports = mongoose.model('User', userSchema)
