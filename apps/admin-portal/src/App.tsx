import { Routes, Route, Navigate } from 'react-router-dom'
import { SignedIn, SignedOut } from '@clerk/clerk-react'
import AdminLayout from './components/layouts/AdminLayout'
import Dashboard from './pages/Dashboard'
import Trucks from './pages/Trucks'
import Users from './pages/Users'
import SignInPage from './pages/auth/SignIn'
import SignUpPage from './pages/auth/SignUp'

function AuthGuard({ children }: { children: React.ReactNode }) {
  // DEV_MODE: controlled via VITE_DEV_MODE in apps/admin-portal/.env
  // true  → bypass Clerk (no sign-in required, uses dev_bypass_admin token)
  // false → require real Clerk session (for production or auth testing)
  const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true'
  if (DEV_MODE) return <>{children}</>

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
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/sign-up" element={<SignUpPage />} />

      <Route
        path="/"
        element={
          <AuthGuard>
            <AdminLayout />
          </AuthGuard>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="trucks" element={<Trucks />} />
        <Route path="users" element={<Users />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
