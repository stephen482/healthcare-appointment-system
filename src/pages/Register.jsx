import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Login.css'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [f, setF] = useState({ username: '', email: '', password: '', confirm: '' })
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setError('') }

  const submit = async (e) => {
    e.preventDefault()

    if (!/^[A-Za-z0-9_.]{3,20}$/.test(f.username.trim())) {
      return setError('Username must be 3 to 20 letters, numbers, dots or underscores.')
    }
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) return setError('Please enter a valid email address.')
    if (f.password.length < 8) return setError('Password must be at least 8 characters.')
    if (f.password !== f.confirm) return setError('Passwords do not match.')

    setLoading(true)
    const res = await register({ username: f.username, email: f.email, password: f.password })
    setLoading(false)

    if (!res.ok) return setError(res.error)
    navigate('/', { replace: true })
  }

  return (
    <div className="au-page">
      <div className="au-card">
        <aside className="au-side">
          <span className="au-logo">+</span>
          <h2>Create your account</h2>
          <p>Sign up in seconds to book and manage your appointments.</p>
          <ul>
            <li>Free for patients</li>
            <li>Find specialists in 14 fields</li>
            <li>Instant booking confirmation</li>
          </ul>
        </aside>

        <div className="au-form-wrap">
          <h1>Register</h1>
          <p className="au-sub">Create a patient account.</p>

          <form onSubmit={submit}>
            <div className="au-field">
              <label htmlFor="au-user">Username</label>
              <input id="au-user" className="au-input" value={f.username} onChange={set('username')} placeholder="jane_doe" autoComplete="username" />
            </div>

            <div className="au-field">
              <label htmlFor="au-email">Email</label>
              <input id="au-email" className="au-input" type="email" value={f.email} onChange={set('email')} placeholder="you@example.com" autoComplete="email" />
            </div>

            <div className="au-row">
              <div className="au-field">
                <label htmlFor="au-pw">Password</label>
                <div className="au-pass">
                  <input id="au-pw" className="au-input" type={show ? 'text' : 'password'} value={f.password} onChange={set('password')} placeholder="At least 8 characters" autoComplete="new-password" />
                  <button type="button" onClick={() => setShow(!show)}>{show ? 'Hide' : 'Show'}</button>
                </div>
              </div>
              <div className="au-field">
                <label htmlFor="au-confirm">Confirm password</label>
                <input id="au-confirm" className="au-input" type={show ? 'text' : 'password'} value={f.confirm} onChange={set('confirm')} placeholder="Repeat password" autoComplete="new-password" />
              </div>
            </div>

            {error && <div className="au-error" role="alert">⚠ {error}</div>}

            <button type="submit" className="au-submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="au-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}