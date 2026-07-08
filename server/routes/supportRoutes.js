const express = require('express')
const router = express.Router()
const supportController = require('../controllers/supportController')
const { protect, authorize } = require('../middleware/auth')

router.post('/', protect, supportController.createTicket)
router.get('/my', protect, supportController.getMyTickets)
router.get('/', protect, authorize('admin', 'staff'), supportController.getAllTickets)
router.get('/:id', protect, supportController.getTicket)
router.post('/:id/reply', protect, supportController.replyToTicket)
router.put('/:id/close', protect, authorize('admin', 'staff'), supportController.closeTicket)

module.exports = router
