const express = require('express')
const router = express.Router()
const quoteController = require('../controllers/quoteController')
const { protect, authorize } = require('../middleware/auth')
const { validate, quoteValidation } = require('../middleware/validators')

// Optional auth: attach user if logged in, but allow guest quotes
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization?.startsWith('Bearer ')) {
    const { protect } = require('../middleware/auth')
    return protect(req, res, next)
  }
  next()
}

router.post('/', optionalAuth, quoteValidation, validate, quoteController.createQuote)
router.get('/my', protect, quoteController.getMyQuotes)
router.get('/', protect, authorize('admin', 'staff'), quoteController.getAllQuotes)
router.get('/:id', protect, authorize('admin', 'staff'), quoteController.getQuote)
router.put('/:id', protect, authorize('admin', 'staff'), quoteController.updateQuote)

module.exports = router
