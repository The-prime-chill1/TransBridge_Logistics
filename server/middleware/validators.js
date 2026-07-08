const { validationResult, body } = require('express-validator')

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array(),
    })
  }
  next()
}

const registerValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('country').trim().notEmpty().withMessage('Country is required'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must include uppercase, lowercase letters and a number'),
]

const loginValidation = [
  body('identifier').trim().notEmpty().withMessage('Email or phone number is required'),
  body('password').notEmpty().withMessage('Password is required'),
]

const shipmentValidation = [
  body('customer').notEmpty().withMessage('Customer is required'),
  body('receiver.name').trim().notEmpty().withMessage('Receiver name is required'),
  body('receiver.phone').trim().notEmpty().withMessage('Receiver phone is required'),
  body('origin').trim().notEmpty().withMessage('Origin is required'),
  body('destination').trim().notEmpty().withMessage('Destination is required'),
  body('weight').isFloat({ min: 0.01 }).withMessage('Valid weight is required'),
]

const quoteValidation = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('serviceType').notEmpty().withMessage('Service type is required'),
  body('origin').trim().notEmpty().withMessage('Origin is required'),
  body('destination').trim().notEmpty().withMessage('Destination is required'),
]

module.exports = { validate, registerValidation, loginValidation, shipmentValidation, quoteValidation }
