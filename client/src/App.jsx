import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import LoadingScreen from './components/common/LoadingScreen'
import PublicLayout from './components/layout/PublicLayout'
import CustomerLayout from './components/layout/CustomerLayout'
import AdminLayout from './components/layout/AdminLayout'

// Public pages
const Home = lazy(() => import('./pages/public/Home'))
const About = lazy(() => import('./pages/public/About'))
const Services = lazy(() => import('./pages/public/Services'))
const Pricing = lazy(() => import('./pages/public/Pricing'))
const GetQuote = lazy(() => import('./pages/public/GetQuote'))
const TrackShipment = lazy(() => import('./pages/public/TrackShipment'))
const Contact = lazy(() => import('./pages/public/Contact'))
const FAQ = lazy(() => import('./pages/public/FAQ'))
const PrivacyPolicy = lazy(() => import('./pages/public/PrivacyPolicy'))
const Terms = lazy(() => import('./pages/public/Terms'))

// Auth pages
const Login = lazy(() => import('./pages/public/Login'))
const Register = lazy(() => import('./pages/public/Register'))
const ForgotPassword = lazy(() => import('./pages/public/ForgotPassword'))
const VerifyOTP = lazy(() => import('./pages/public/VerifyOTP'))
const ResetPassword = lazy(() => import('./pages/public/ResetPassword'))

// Customer pages
const CustomerDashboard = lazy(() => import('./pages/customer/Dashboard'))
const CustomerShipments = lazy(() => import('./pages/customer/Shipments'))
const CustomerShipmentDetail = lazy(() => import('./pages/customer/ShipmentDetail'))
const CustomerNotifications = lazy(() => import('./pages/customer/Notifications'))
const CustomerQuotes = lazy(() => import('./pages/customer/Quotes'))
const CustomerInvoices = lazy(() => import('./pages/customer/Invoices'))
const CustomerProfile = lazy(() => import('./pages/customer/Profile'))
const CustomerSecurity = lazy(() => import('./pages/customer/Security'))
const CustomerAddresses = lazy(() => import('./pages/customer/Addresses'))
const CustomerSupport = lazy(() => import('./pages/customer/Support'))

// Admin pages
const AdminLogin = lazy(() => import('./pages/admin/Login'))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminShipments = lazy(() => import('./pages/admin/Shipments'))
const AdminShipmentForm = lazy(() => import('./pages/admin/ShipmentForm'))
const AdminCustomers = lazy(() => import('./pages/admin/Customers'))
const AdminAnalytics = lazy(() => import('./pages/admin/Analytics'))
const AdminQuotes = lazy(() => import('./pages/admin/Quotes'))
const AdminNotifications = lazy(() => import('./pages/admin/Notifications'))
const AdminSupport = lazy(() => import('./pages/admin/Support'))
const AdminSettings = lazy(() => import('./pages/admin/Settings'))

function ProtectedRoute({ children, role = 'customer' }) {
  const { user, loading, initialized } = useAuth()
  if (!initialized || loading) return <LoadingScreen />
  if (!user) return <Navigate to={role === 'admin' ? '/admin/login' : '/login'} replace />
  if (role === 'admin' && user.role !== 'admin') return <Navigate to='/' replace />
  if (role === 'customer' && user.role === 'admin') return <Navigate to='/admin' replace />
  return children
}

function GuestRoute({ children }) {
  const { user, initialized, loading } = useAuth()
  if (!initialized || loading) return <LoadingScreen />
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
  return children
}

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout />}>
          <Route path='/' element={<Home />} />
          <Route path='/about' element={<About />} />
          <Route path='/services' element={<Services />} />
          <Route path='/pricing' element={<Pricing />} />
          <Route path='/get-quote' element={<GetQuote />} />
          <Route path='/track' element={<TrackShipment />} />
          <Route path='/track/:trackingNumber' element={<TrackShipment />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/faq' element={<FAQ />} />
          <Route path='/privacy' element={<PrivacyPolicy />} />
          <Route path='/terms' element={<Terms />} />
        </Route>

        {/* Auth routes */}
        <Route path='/login' element={<GuestRoute><Login /></GuestRoute>} />
        <Route path='/register' element={<GuestRoute><Register /></GuestRoute>} />
        <Route path='/forgot-password' element={<GuestRoute><ForgotPassword /></GuestRoute>} />
        <Route path='/verify-otp' element={<VerifyOTP />} />
        <Route path='/reset-password' element={<ResetPassword />} />

        {/* Customer routes */}
        <Route path='/dashboard' element={<ProtectedRoute><CustomerLayout /></ProtectedRoute>}>
          <Route index element={<CustomerDashboard />} />
          <Route path='shipments' element={<CustomerShipments />} />
          <Route path='shipments/:id' element={<CustomerShipmentDetail />} />
          <Route path='notifications' element={<CustomerNotifications />} />
          <Route path='quotes' element={<CustomerQuotes />} />
          <Route path='invoices' element={<CustomerInvoices />} />
          <Route path='profile' element={<CustomerProfile />} />
          <Route path='security' element={<CustomerSecurity />} />
          <Route path='addresses' element={<CustomerAddresses />} />
          <Route path='support' element={<CustomerSupport />} />
        </Route>

        {/* Admin routes */}
        <Route path='/admin/login' element={<GuestRoute><AdminLogin /></GuestRoute>} />
        <Route path='/admin' element={<ProtectedRoute role='admin'><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path='shipments' element={<AdminShipments />} />
          <Route path='shipments/new' element={<AdminShipmentForm />} />
          <Route path='shipments/:id/edit' element={<AdminShipmentForm />} />
          <Route path='customers' element={<AdminCustomers />} />
          <Route path='analytics' element={<AdminAnalytics />} />
          <Route path='quotes' element={<AdminQuotes />} />
          <Route path='notifications' element={<AdminNotifications />} />
          <Route path='support' element={<AdminSupport />} />
          <Route path='settings' element={<AdminSettings />} />
        </Route>

        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <AppRoutes />
          <Toaster
            position='top-right'
            toastOptions={{
              duration: 4000,
              style: {
                fontFamily: 'Outfit, sans-serif',
                fontSize: '14px',
                borderRadius: '10px',
                padding: '12px 16px',
              },
              success: { iconTheme: { primary: '#008751', secondary: '#fff' } },
              error: { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
            }}
          />
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
