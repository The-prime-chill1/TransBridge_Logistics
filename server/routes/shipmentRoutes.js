const express = require('express')
const router = express.Router()
const shipmentController = require('../controllers/shipmentController')
const { protect, authorize } = require('../middleware/auth')
const upload = require('../middleware/upload')
const { validate, shipmentValidation } = require('../middleware/validators')

// Public
router.get('/track/:trackingNumber', shipmentController.trackShipment)

// Customer
router.get('/my', protect, shipmentController.getMyShipments)

// Admin/Staff
router.get('/', protect, authorize('admin', 'staff'), shipmentController.getAllShipments)
router.post('/', protect, authorize('admin', 'staff'), shipmentValidation, validate, shipmentController.createShipment)
router.put('/:id', protect, authorize('admin', 'staff'), shipmentController.updateShipment)
router.delete('/:id', protect, authorize('admin'), shipmentController.deleteShipment)
router.put('/:id/restore', protect, authorize('admin'), shipmentController.restoreShipment)
router.post('/:id/images', protect, authorize('admin', 'staff'), upload.array('images', 10), shipmentController.uploadShipmentImages)

// Shared (customer can view own, admin/staff can view all — checked in controller)
router.get('/:id', protect, shipmentController.getShipment)

module.exports = router
