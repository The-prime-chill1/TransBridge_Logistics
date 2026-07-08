const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const { protect } = require('../middleware/auth')
const { authLimiter, otpLimiter } = require('../middleware/rateLimiter')
const { validate, registerValidation, loginValidation } = require('../middleware/validators')

router.post('/register', authLimiter, registerValidation, validate, authController.register)
router.post('/verify-otp', authLimiter, authController.verifyOTP)
router.post('/resend-otp', otpLimiter, authController.resendOTP)
router.post('/login', authLimiter, loginValidation, validate, authController.login)
router.post('/refresh-token', authController.refreshToken)
router.post('/logout', protect, authController.logout)
router.get('/me', protect, authController.getMe)
router.post('/forgot-password', authLimiter, authController.forgotPassword)
router.post('/reset-password', authLimiter, authController.resetPassword)
router.put('/change-password', protect, authController.changePassword)

module.exports = router
