import { Routes, Route, Navigate } from 'react-router-dom'
import { SignedIn, SignedOut } from '@clerk/clerk-react'
import DashboardLayout from './components/layouts/DashboardLayout'
import Dashboard from './pages/Dashboard'
import Orders from './pages/Orders'
import Menu from './pages/Menu'
import Settings from './pages/Settings'
import SignInPage from './pages/auth/SignIn'
import SignUpPage from './pages/auth/SignUp'

function AuthGuard({ children }: { children: React.ReactNode }) {
  // We use Clerk's SignedIn component to protect routes
  // But for dev, we can also bypass it here if needed
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <Navigate to="/sign-in" replace />
      </SignedOut>
    </>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/sign-in" element={
        <SignedOut>
          <SignInPage />
        </SignedOut>
      } />
      <Route path="/sign-up" element={
        <SignedOut>
          <SignUpPage />
        </SignedOut>
      } />

      {/* Protected Dashboard Routes */}
      <Route
        path="/"
        element={
          <AuthGuard>
            <DashboardLayout />
          </AuthGuard>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="menu" element={<Menu />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
