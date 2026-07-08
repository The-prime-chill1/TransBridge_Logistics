const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const { protect, authorize } = require('../middleware/auth')
const upload = require('../middleware/upload')

// Customer profile
router.get('/profile', protect, userController.getProfile)
router.put('/profile', protect, userController.updateProfile)
router.post('/avatar', protect, upload.single('avatar'), userController.uploadAvatar)

// Addresses
router.post('/addresses', protect, userController.addAddress)
router.put('/addresses/:addressId', protect, userController.updateAddress)
router.delete('/addresses/:addressId', protect, userController.deleteAddress)

// Admin management
router.get('/', protect, authorize('admin', 'staff'), userController.getAllUsers)
router.get('/:id', protect, authorize('admin', 'staff'), userController.getUser)
router.put('/:id', protect, authorize('admin', 'staff'), userController.updateUser)
router.put('/:id/deactivate', protect, authorize('admin'), userController.deactivateUser)

module.exports = router
