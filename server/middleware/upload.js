const multer = require('multer')
const path = require('path')

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif|pdf/
  const extValid = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimeValid = allowedTypes.test(file.mimetype)

  if (extValid && mimeValid) {
    cb(null, true)
  } else {
    cb(new Error('Only image files (JPEG, PNG, WEBP, GIF) and PDFs are allowed'), false)
  }
}

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter,
})

module.exports = upload
