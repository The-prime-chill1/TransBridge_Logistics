const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

const BRAND = {
  navy: '#0A1D56',
  gold: '#D4A017',
  green: '#008751',
  dark: '#071228',
}

function wrapTemplate(title, bodyHtml) {
  return `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; background:#f4f6fb; padding:32px 16px;">
    <div style="max-width:520px; margin:0 auto; background:#ffffff; border-radius:14px; overflow:hidden; box-shadow:0 4px 24px rgba(10,29,86,0.08);">
      <div style="background:${BRAND.dark}; padding:28px 32px; text-align:center;">
        <div style="display:inline-block; width:40px; height:40px; background:${BRAND.gold}; border-radius:10px; line-height:40px; font-weight:900; color:${BRAND.dark}; font-size:16px; margin-bottom:8px;">TB</div>
        <div style="color:#fff; font-size:18px; font-weight:800; letter-spacing:-0.3px;">TRANS<span style="color:${BRAND.gold};">BRIDGE</span></div>
        <div style="color:rgba(255,255,255,0.4); font-size:10px; letter-spacing:2px; text-transform:uppercase; margin-top:2px;">Logistics</div>
      </div>
      <div style="padding:36px 32px;">
        <h2 style="color:${BRAND.navy}; font-size:20px; margin:0 0 16px;">${title}</h2>
        ${bodyHtml}
      </div>
      <div style="background:#f8f9fc; padding:20px 32px; text-align:center; border-top:1px solid #eef0f8;">
        <p style="font-size:12px; color:#9aa3bd; margin:0;">© ${new Date().getFullYear()} TransBridge Logistics Ltd. Across Borders, On Time.</p>
        <p style="font-size:12px; color:#9aa3bd; margin:6px 0 0;">UK: +44 7934 219309 &nbsp;|&nbsp; NG: 08165595873</p>
      </div>
    </div>
  </div>`
}

async function sendEmail({ to, subject, html }) {
  try {
    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'TransBridge Logistics'}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    })
    return true
  } catch (err) {
    console.error('Email send error:', err.message)
    return false
  }
}

const emailService = {
  sendOTP: async (to, code, type = 'registration') => {
    const purpose = {
      registration: 'verify your new TransBridge account',
      'password-reset': 'reset your password',
      'change-password': 'confirm your password change',
    }[type] || 'verify your identity'

    const expiry = type === 'registration' ? '5 minutes' : '10 minutes'

    return sendEmail({
      to,
      subject: `Your TransBridge Verification Code`,
      html: wrapTemplate('Verify Your Identity', `
        <p style="color:#3d4b70; font-size:14px; line-height:1.7;">Use the code below to ${purpose}. This code expires in ${expiry}.</p>
        <div style="background:#f8f9fc; border:1.5px dashed ${BRAND.gold}; border-radius:10px; padding:20px; text-align:center; margin:20px 0;">
          <span style="font-size:32px; font-weight:800; letter-spacing:8px; color:${BRAND.navy};">${code}</span>
        </div>
        <p style="color:#9aa3bd; font-size:12px;">If you didn't request this code, please ignore this email or contact our support team.</p>
      `),
    })
  },

  sendShipmentCreated: async (to, shipment) => {
    return sendEmail({
      to,
      subject: `Shipment Created — ${shipment.trackingNumber}`,
      html: wrapTemplate('Your Shipment Has Been Created', `
        <p style="color:#3d4b70; font-size:14px; line-height:1.7;">Great news! Your shipment has been created and is now being processed.</p>
        <div style="background:#f8f9fc; border-radius:10px; padding:18px; margin:20px 0;">
          <p style="margin:0 0 8px; font-size:13px;"><strong>Tracking Number:</strong> ${shipment.trackingNumber}</p>
          <p style="margin:0 0 8px; font-size:13px;"><strong>Origin:</strong> ${shipment.origin}</p>
          <p style="margin:0; font-size:13px;"><strong>Destination:</strong> ${shipment.destination}</p>
        </div>
        <p style="color:#3d4b70; font-size:14px;">Track your shipment anytime using the tracking number above.</p>
      `),
    })
  },

  sendShipmentUpdated: async (to, shipment) => {
    return sendEmail({
      to,
      subject: `Shipment Update — ${shipment.trackingNumber}`,
      html: wrapTemplate('Shipment Status Updated', `
        <p style="color:#3d4b70; font-size:14px; line-height:1.7;">Your shipment status has been updated.</p>
        <div style="background:#f8f9fc; border-radius:10px; padding:18px; margin:20px 0;">
          <p style="margin:0 0 8px; font-size:13px;"><strong>Tracking Number:</strong> ${shipment.trackingNumber}</p>
          <p style="margin:0 0 8px; font-size:13px;"><strong>New Status:</strong> <span style="color:${BRAND.gold};">${shipment.status}</span></p>
          <p style="margin:0; font-size:13px;"><strong>Current Location:</strong> ${shipment.currentLocation || 'N/A'}</p>
        </div>
      `),
    })
  },

  sendShipmentDelivered: async (to, shipment) => {
    return sendEmail({
      to,
      subject: `Delivered! — ${shipment.trackingNumber}`,
      html: wrapTemplate('Your Shipment Has Been Delivered 🎉', `
        <p style="color:#3d4b70; font-size:14px; line-height:1.7;">Your shipment <strong>${shipment.trackingNumber}</strong> has been successfully delivered. Thank you for choosing TransBridge Logistics!</p>
      `),
    })
  },

  sendQuoteConfirmation: async (to, quote) => {
    return sendEmail({
      to,
      subject: 'We Received Your Quote Request',
      html: wrapTemplate('Quote Request Received', `
        <p style="color:#3d4b70; font-size:14px; line-height:1.7;">Thank you for requesting a quote. Our team will review your request for <strong>${quote.serviceType}</strong> from ${quote.origin} to ${quote.destination} and respond within 24 hours.</p>
      `),
    })
  },

  sendSupportReply: async (to, ticket, message) => {
    return sendEmail({
      to,
      subject: `Re: ${ticket.subject} [${ticket.ticketNumber}]`,
      html: wrapTemplate('New Reply on Your Support Ticket', `
        <p style="color:#3d4b70; font-size:14px; line-height:1.7;">${message}</p>
        <p style="color:#9aa3bd; font-size:12px; margin-top:16px;">Ticket: ${ticket.ticketNumber}</p>
      `),
    })
  },
}

module.exports = emailService
