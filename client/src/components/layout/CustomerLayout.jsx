import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard, Package, Bell, FileText, CreditCard,
  User, Shield, MapPin, HeadphonesIcon, LogOut, Menu, X, ChevronRight
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { Sun, Moon } from 'lucide-react'
import toast from 'react-hot-toast'
import styles from './CustomerLayout.module.css'

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
  { icon: Package, label: 'My Shipments', to: '/dashboard/shipments' },
  { icon: Bell, label: 'Notifications', to: '/dashboard/notifications' },
  { icon: FileText, label: 'Quotes', to: '/dashboard/quotes' },
  { icon: CreditCard, label: 'Invoices', to: '/dashboard/invoices' },
  { icon: MapPin, label: 'Saved Addresses', to: '/dashboard/addresses' },
  { icon: HeadphonesIcon, label: 'Support', to: '/dashboard/support' },
  { icon: User, label: 'Profile', to: '/dashboard/profile' },
  { icon: Shield, label: 'Security', to: '/dashboard/security' },
]

export default function CustomerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : 'U'

  return (
    <div className={styles.layout}>
      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarLogo}>
            <div className={styles.logoMark}>TB</div>
            <span>TRANS<span className={styles.accent}>BRIDGE</span></span>
          </div>
          <button className={styles.closeBtn} onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.userCard}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.firstName} {user?.lastName}</span>
            <span className={styles.userRole}>Customer</span>
          </div>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map(({ icon: Icon, label, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard'}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={18} />
              <span>{label}</span>
              <ChevronRight size={14} className={styles.chevron} />
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={17} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={styles.main}>
        {/* Top Bar */}
        <header className={styles.topbar}>
          <button className={styles.menuBtn} onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div className={styles.topbarRight}>
            <button className={styles.iconBtn} onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className={styles.topbarAvatar}>{initials}</div>
          </div>
        </header>

        {/* Page Content */}
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
