const axios = require('axios')

const TERMII_BASE_URL = 'https://api.ng.termii.com/api'

async function sendSMS(to, message) {
  try {
    // Normalize phone number to international format without '+' for Termii
    const formattedTo = to.replace(/^\+/, '')

    const res = await axios.post(`${TERMII_BASE_URL}/sms/send`, {
      to: formattedTo,
      from: process.env.TERMII_SENDER_ID || 'TransBridge',
      sms: message,
      type: 'plain',
      channel: 'generic',
      api_key: process.env.TERMII_API_KEY,
    })
    return res.data?.message_id ? true : false
  } catch (err) {
    console.error('SMS send error:', err.response?.data || err.message)
    return false
  }
}

const smsService = {
  sendOTP: async (phone, code, type = 'registration') => {
    const message = `Your TransBridge verification code is ${code}. ${
      type === 'registration' ? 'It expires in 5 minutes.' : 'It expires in 10 minutes.'
    } Do not share this code with anyone.`
    return sendSMS(phone, message)
  },

  sendShipmentUpdate: async (phone, shipment) => {
    const message = `TransBridge Update: Shipment ${shipment.trackingNumber} is now "${shipment.status}". Track at transbridgelogistics.com/track/${shipment.trackingNumber}`
    return sendSMS(phone, message)
  },

  sendDeliveryNotification: async (phone, shipment) => {
    const message = `TransBridge: Your shipment ${shipment.trackingNumber} has been delivered! Thank you for shipping with us.`
    return sendSMS(phone, message)
  },

  sendSecurityAlert: async (phone, action) => {
    const message = `TransBridge Security Alert: ${action} was just performed on your account. If this wasn't you, contact support immediately.`
    return sendSMS(phone, message)
  },
}

module.exports = smsService
