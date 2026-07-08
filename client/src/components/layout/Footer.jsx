import { Link } from 'react-router-dom'
import { MapPin, Mail, Phone, MessageCircle, ArrowRight } from 'lucide-react'
import styles from './Footer.module.css'

const SERVICES = ['Air Freight', 'Sea Freight', 'Door-to-Door', 'Customs Clearance', 'Warehousing', 'Package Consolidation']
const COMPANY = [
  { label: 'About Us', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Get a Quote', to: '/get-quote' },
  { label: 'FAQ', to: '/faq' },
]
const LEGAL = [
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms & Conditions', to: '/terms' },
  { label: 'Track Shipment', to: '/track' },
  { label: 'Contact Us', to: '/contact' },
]

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className='container'>
          <div className={styles.grid}>
            {/* Brand */}
            <div className={styles.brandCol}>
              <Link to='/' className={styles.logo}>
                <div className={styles.logoMark}>TB</div>
                <div className={styles.logoText}>
                  <span>TRANS<span className={styles.accent}>BRIDGE</span></span>
                  <span className={styles.logoSub}>LOGISTICS</span>
                </div>
              </Link>
              <p className={styles.tagline}>
                Across Borders, On Time. Connecting the United Kingdom and Nigeria through secure, reliable, and technology-driven logistics.
              </p>
              <div className={styles.contacts}>
                <a href='https://wa.me/447934219309' target='_blank' rel='noopener noreferrer' className={styles.contactItem}>
                  <MessageCircle size={16} />
                  <span>+44 7934 219309 (UK)</span>
                </a>
                <a href='https://wa.me/2348165595873' target='_blank' rel='noopener noreferrer' className={styles.contactItem}>
                  <MessageCircle size={16} />
                  <span>08165595873 (NG)</span>
                </a>
                <a href='mailto:Transbridgelogistics01@gmail.com' className={styles.contactItem}>
                  <Mail size={16} />
                  <span>Transbridgelogistics01@gmail.com</span>
                </a>
              </div>
            </div>

            {/* Services */}
            <div className={styles.col}>
              <h4 className={styles.colTitle}>Services</h4>
              <ul className={styles.colLinks}>
                {SERVICES.map(s => (
                  <li key={s}>
                    <Link to='/services' className={styles.colLink}>
                      <ArrowRight size={12} /> {s}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div className={styles.col}>
              <h4 className={styles.colTitle}>Company</h4>
              <ul className={styles.colLinks}>
                {COMPANY.map(item => (
                  <li key={item.to}>
                    <Link to={item.to} className={styles.colLink}>
                      <ArrowRight size={12} /> {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal & Account */}
            <div className={styles.col}>
              <h4 className={styles.colTitle}>Quick Links</h4>
              <ul className={styles.colLinks}>
                {LEGAL.map(item => (
                  <li key={item.to}>
                    <Link to={item.to} className={styles.colLink}>
                      <ArrowRight size={12} /> {item.label}
                    </Link>
                  </li>
                ))}
                <li><Link to='/login' className={styles.colLink}><ArrowRight size={12} /> Customer Login</Link></li>
                <li><Link to='/register' className={styles.colLink}><ArrowRight size={12} /> Register</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className='container'>
          <div className={styles.bottomInner}>
            <p className={styles.copy}>
              © {new Date().getFullYear()} TransBridge Logistics Ltd. All rights reserved.
            </p>
            <p className={styles.flag}>🇬🇧 &nbsp; Connecting UK & Nigeria &nbsp; 🇳🇬</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
