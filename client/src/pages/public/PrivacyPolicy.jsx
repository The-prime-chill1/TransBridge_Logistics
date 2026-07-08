import { useEffect } from 'react'
import styles from './Legal.module.css'

export default function PrivacyPolicy() {
  useEffect(() => { document.title = 'Privacy Policy — TransBridge Logistics' }, [])
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className='container'>
          <h1 className={styles.title}>Privacy Policy</h1>
          <p className={styles.updated}>Last updated: June 2026</p>
        </div>
      </div>
      <div className='container'>
        <div className={styles.content}>
          <p className={styles.intro}>
            TransBridge Logistics ("we", "our", "us") is committed to protecting your personal information.
            This Privacy Policy explains how we collect, use, and safeguard your data when you use our
            website and services.
          </p>

          {[
            {
              title: '1. Information We Collect',
              body: `We collect information you provide directly to us, including: name, email address, phone number, country of residence, delivery addresses, shipment details, and payment information. We also collect usage data automatically, including IP addresses, browser type, pages visited, and device information.`,
            },
            {
              title: '2. How We Use Your Information',
              body: `We use your information to: process and track shipments, send OTP verification codes via email and SMS, communicate shipment status updates, respond to customer inquiries, improve our services, and comply with legal obligations.`,
            },
            {
              title: '3. OTP and Authentication Data',
              body: `OTP codes are generated for account verification and security purposes. They are stored in hashed form and automatically expire. We do not store plaintext OTP codes. All verification is conducted over secure channels.`,
            },
            {
              title: '4. Data Sharing',
              body: `We do not sell your personal information. We may share data with: courier and logistics partners (to fulfil your shipment), customs authorities (as required by law), payment processors, and our SMS/email service providers (Termii and Nodemailer) solely for delivery of communications.`,
            },
            {
              title: '5. Data Retention',
              body: `We retain your personal data for as long as your account is active and as needed to provide services. Shipment records are retained for 7 years for legal and customs compliance purposes. You may request deletion of your account at any time.`,
            },
            {
              title: '6. Security',
              body: `We implement industry-standard security measures including bcrypt password hashing, JWT authentication with HttpOnly cookies, HTTPS encryption, rate limiting, and regular security audits. No system is 100% secure, and we encourage you to use strong, unique passwords.`,
            },
            {
              title: '7. Your Rights',
              body: `Under GDPR and applicable Nigerian data protection law (NDPA), you have the right to: access your personal data, correct inaccurate data, request deletion, object to processing, and data portability. To exercise these rights, contact us at Transbridgelogistics01@gmail.com.`,
            },
            {
              title: '8. Cookies',
              body: `We use essential cookies for authentication (refresh token storage in HttpOnly cookies) and analytics. You may disable non-essential cookies in your browser settings.`,
            },
            {
              title: '9. Contact Us',
              body: `For privacy-related inquiries: Transbridgelogistics01@gmail.com | +44 7934 219309`,
            },
          ].map(s => (
            <div key={s.title} className={styles.section}>
              <h2 className={styles.sectionTitle}>{s.title}</h2>
              <p className={styles.sectionBody}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
