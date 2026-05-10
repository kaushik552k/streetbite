import { Routes, Route, Navigate } from 'react-router-dom'
import { SignedIn, SignedOut } from '@clerk/clerk-react'
import AdminLayout from './components/layouts/AdminLayout'
import Dashboard from './pages/Dashboard'
import Trucks from './pages/Trucks'
import Users from './pages/Users'
import SignInPage from './pages/auth/SignIn'
import SignUpPage from './pages/auth/SignUp'

function AuthGuard({ children }: { children: React.ReactNode }) {
  // DEV MODE: Mocking admin state to bypass clerk for testing UI immediately
  const MOCK_SIGNED_IN = true

  if (!MOCK_SIGNED_IN) {
    return <Navigate to="/sign-in" replace />
  }

  return <>{children}</>
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
