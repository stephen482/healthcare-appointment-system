import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)
const USERS_KEY = 'medibook_users'
const SESSION_KEY = 'medibook_user'

/* Temporary local accounts. These are replaced by the Django API (JWT) in Stage 4. */

function readUsers() {
  try {
    const v = JSON.parse(localStorage.getItem(USERS_KEY))
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

function writeUsers(list) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(list))
  } catch {
    /* storage unavailable */
  }
}

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY))
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSession)

  const startSession = (u) => {
    const safe = { id: u.id, username: u.username, email: u.email, createdAt: u.createdAt }
    setUser(safe)
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(safe))
    } catch {
      /* ignore */
    }
    return safe
  }

  const register = ({ username, email, password }) => {
    const users = readUsers()
    const name = username.trim()
    const mail = email.trim().toLowerCase()

    if (users.some((u) => u.username.toLowerCase() === name.toLowerCase())) {
      return { ok: false, error: 'That username is already taken.' }
    }
    if (users.some((u) => u.email === mail)) {
      return { ok: false, error: 'An account with this email already exists.' }
    }

    const newUser = {
      id: Date.now(),
      username: name,
      email: mail,
      password,
      createdAt: new Date().toISOString(),
    }
    writeUsers([...users, newUser])
    return { ok: true, user: startSession(newUser) }
  }

  const login = (identifier, password) => {
    const key = identifier.trim().toLowerCase()
    const found = readUsers().find(
      (u) => u.username.toLowerCase() === key || u.email === key
    )
    if (!found || found.password !== password) {
      return { ok: false, error: 'Incorrect username/email or password.' }
    }
    return { ok: true, user: startSession(found) }
  }

  const logout = () => {
    setUser(null)
    try {
      localStorage.removeItem(SESSION_KEY)
    } catch {
      /* ignore */
    }
  }

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}