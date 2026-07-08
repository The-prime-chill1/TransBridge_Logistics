const cloudinary = require('../config/cloudinary')
const streamifier = require('stream').Readable

function bufferToStream(buffer) {
  const stream = new streamifier()
  stream.push(buffer)
  stream.push(null)
  return stream
}

const uploadService = {
  async uploadBuffer(buffer, folder = 'transbridge/general') {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'auto' },
        (error, result) => {
          if (error) return reject(error)
          resolve({ url: result.secure_url, publicId: result.public_id })
        }
      )
      bufferToStream(buffer).pipe(uploadStream)
    })
  },

  async uploadMultiple(files, folder = 'transbridge/general') {
    return Promise.all(files.map(file => this.uploadBuffer(file.buffer, folder)))
  },

  async deleteFile(publicId) {
    try {
      await cloudinary.uploader.destroy(publicId)
      return true
    } catch (err) {
      console.error('Cloudinary delete error:', err.message)
      return false
    }
  },
}

module.exports = uploadService
