import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon, Menu, X, ChevronDown, Package, LogIn, UserPlus } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import styles from './Navbar.module.css'

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Track', to: '/track' },
  { label: 'Contact', to: '/contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location])

  return (
    <>
      <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.inner}>
          {/* Logo */}
          <Link to='/' className={styles.logo}>
            <div className={styles.logoMark}>TB</div>
            <div className={styles.logoText}>
              <span className={styles.logoMain}>TRANS<span className={styles.logoAccent}>BRIDGE</span></span>
              <span className={styles.logoSub}>LOGISTICS</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <ul className={styles.links}>
            {NAV_LINKS.map(link => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className={styles.actions}>
            <button className={styles.themeToggle} onClick={toggleTheme} aria-label='Toggle theme'>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <div className={styles.userMenu}>
                <Link to='/dashboard' className='btn btn-primary btn-sm'>
                  <Package size={15} /> Dashboard
                </Link>
              </div>
            ) : (
              <>
                <Link to='/login' className='btn btn-ghost btn-sm'>
                  <LogIn size={15} /> Login
                </Link>
                <Link to='/register' className='btn btn-primary btn-sm'>
                  <UserPlus size={15} /> Get Started
                </Link>
              </>
            )}

            <button
              className={styles.mobileToggle}
              onClick={() => setMobileOpen(v => !v)}
              aria-label='Toggle menu'
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className={styles.mobileMenu}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <ul className={styles.mobileLinks}>
              {NAV_LINKS.map(link => (
                <li key={link.to}>
                  <NavLink to={link.to} end={link.to === '/'} className={styles.mobileLink}>
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
            <div className={styles.mobileCTA}>
              {user ? (
                <Link to='/dashboard' className='btn btn-primary' style={{ width: '100%', justifyContent: 'center' }}>
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to='/login' className='btn btn-secondary' style={{ flex: 1, justifyContent: 'center' }}>Login</Link>
                  <Link to='/register' className='btn btn-primary' style={{ flex: 1, justifyContent: 'center' }}>Register</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
