const express = require('express')
const router = express.Router()
const analyticsController = require('../controllers/analyticsController')
const { protect, authorize } = require('../middleware/auth')

router.get('/dashboard', protect, authorize('admin', 'staff'), analyticsController.getDashboardStats)
router.get('/revenue', protect, authorize('admin'), analyticsController.getRevenueAnalytics)
router.get('/shipments', protect, authorize('admin', 'staff'), analyticsController.getShipmentAnalytics)

module.exports = router
