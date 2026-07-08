import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard, Package, Users, BarChart3, FileText,
  Bell, HeadphonesIcon, Settings, LogOut, Menu, X, ShieldCheck, Plus
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { Sun, Moon } from 'lucide-react'
import toast from 'react-hot-toast'
import styles from './AdminLayout.module.css'

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Overview', to: '/admin' },
  { icon: Package, label: 'Shipments', to: '/admin/shipments' },
  { icon: Users, label: 'Customers', to: '/admin/customers' },
  { icon: BarChart3, label: 'Analytics', to: '/admin/analytics' },
  { icon: FileText, label: 'Quote Requests', to: '/admin/quotes' },
  { icon: Bell, label: 'Notifications', to: '/admin/notifications' },
  { icon: HeadphonesIcon, label: 'Support Center', to: '/admin/support' },
  { icon: Settings, label: 'Settings', to: '/admin/settings' },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/admin/login')
  }

  const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : 'A'

  return (
    <div className={styles.layout}>
      {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}

      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarLogo}>
            <div className={styles.logoMark}>TB</div>
            <div className={styles.logoTextWrap}>
              <span>TRANS<span className={styles.accent}>BRIDGE</span></span>
              <span className={styles.adminBadge}><ShieldCheck size={10} /> Admin Panel</span>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={() => setSidebarOpen(false)}><X size={18} /></button>
        </div>

        <div className={styles.quickAction}>
          <NavLink to='/admin/shipments/new' className={styles.newShipmentBtn}>
            <Plus size={16} /> New Shipment
          </NavLink>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map(({ icon: Icon, label, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.userCard}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.firstName} {user?.lastName}</span>
            <span className={styles.userRole}>Administrator</span>
          </div>
          <button className={styles.logoutIconBtn} onClick={handleLogout} title='Sign Out'>
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <button className={styles.menuBtn} onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div className={styles.topbarTitle}>Admin Control Center</div>
          <div className={styles.topbarRight}>
            <button className={styles.iconBtn} onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
