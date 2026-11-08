import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Login.css'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!identifier.trim() || !password) {
      setError('Please enter your username or email and your password.')
      return
    }

    setLoading(true)
    const res = await login(identifier, password)
    setLoading(false)

    if (!res.ok) {
      setError(res.error)
      return
    }
    navigate(location.state?.from || '/', { replace: true })
  }

  return (
    <div className="au-page">
      <div className="au-card">
        <aside className="au-side">
          <span className="au-logo">+</span>
          <h2>Welcome back</h2>
          <p>Log in to book appointments and manage your visits in one place.</p>
          <ul>
            <li>Book in a few clicks</li>
            <li>Cancel anytime</li>
            <li>See all your appointments together</li>
          </ul>
        </aside>

        <div className="au-form-wrap">
          <h1>Log in</h1>
          <p className="au-sub">Enter your details to continue.</p>

          <form onSubmit={submit}>
            <div className="au-field">
              <label htmlFor="au-id">Username or email</label>
              <input
                id="au-id"
                className="au-input"
                value={identifier}
                onChange={(e) => { setIdentifier(e.target.value); setError('') }}
                placeholder="e.g. jane_doe"
                autoComplete="username"
              />
            </div>

            <div className="au-field">
              <label htmlFor="au-pw">Password</label>
              <div className="au-pass">
                <input
                  id="au-pw"
                  className="au-input"
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError('') }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShow(!show)}>{show ? 'Hide' : 'Show'}</button>
              </div>
            </div>

            {error && <div className="au-error" role="alert">⚠ {error}</div>}

            <button type="submit" className="au-submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <p className="au-switch">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}