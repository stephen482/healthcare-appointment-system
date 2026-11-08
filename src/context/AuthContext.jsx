import { createContext, useContext, useEffect, useState } from 'react'
import { api, clearTokens, getAccess, saveTokens } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // If there is no saved token there is nothing to check, so we are ready at once.
  const [ready, setReady] = useState(() => !getAccess())

  // On page load: if a token is saved, ask Django who the user is.
  useEffect(() => {
    if (!getAccess()) return undefined
    let cancelled = false

    api
      .get('/api/auth/me/')
      .then((me) => {
        if (!cancelled) setUser(me)
      })
      .catch(() => {
        /* api.js already clears the tokens if they were rejected */
      })
      .finally(() => {
        if (!cancelled) setReady(true)
      })

    return () => {
      cancelled = true
    }
  }, [])

  // api.js sends this event when the session can no longer be renewed.
  useEffect(() => {
    const onLogout = () => setUser(null)
    window.addEventListener('medibook:logout', onLogout)
    return () => window.removeEventListener('medibook:logout', onLogout)
  }, [])

  const login = async (identifier, password) => {
    try {
      const data = await api.post(
        '/api/auth/login/',
        { username: identifier.trim(), password },
        { auth: false }
      )
      saveTokens({ access: data.access, refresh: data.refresh })
      setUser(data.user)
      return { ok: true }
    } catch (err) {
      return {
        ok: false,
        error: err.status === 401 ? 'Incorrect username/email or password.' : err.message,
      }
    }
  }

  const register = async ({ username, email, password }) => {
    try {
      await api.post(
        '/api/auth/register/',
        { username: username.trim(), email: email.trim(), password },
        { auth: false }
      )
    } catch (err) {
      return { ok: false, error: err.message }
    }
    // Account created: log in straight away.
    return login(username, password)
  }

  const logout = () => {
    clearTokens()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}