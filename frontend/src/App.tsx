import { useEffect } from "react"
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom"
import { isAuthenticated } from "./lib/auth"
import AuthPage from "./pages/AuthPage"
import DashboardPage from "./pages/DashboardPage"

function RootRedirect() {
  const navigate = useNavigate()
  useEffect(() => {
    navigate(isAuthenticated() ? "/dashboard" : "/login", { replace: true })
  }, [navigate])
  return null
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<AuthPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
