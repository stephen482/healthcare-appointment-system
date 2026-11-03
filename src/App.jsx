import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Doctors from './pages/Doctors'
import BookAppointment from './pages/BookAppointment'
import MyAppointments from './pages/MyAppointments'
import Profile from './pages/Profile'
import Info from './pages/Info'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function RequireAuth({ children }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />
  }
  return children
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/privacy" element={<Info />} />
          <Route path="/terms" element={<Info />} />
          <Route path="/contact" element={<Info />} />

          <Route path="/book" element={<RequireAuth><BookAppointment /></RequireAuth>} />
          <Route path="/appointments" element={<RequireAuth><MyAppointments /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  )
}