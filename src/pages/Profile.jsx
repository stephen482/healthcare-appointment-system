import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Profile.css'

export default function Profile() {
  const { user } = useAuth()

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently'

  return (
    <div className="pf-page">
      <header className="pf-header">
        <span className="pf-eyebrow">ACCOUNT</span>
        <h1>My Profile</h1>
        <p>Your account details.</p>
      </header>

      <div className="pf-layout">
        <aside className="pf-side">
          <div className="pf-card pf-id">
            <div className="pf-avatar">{user.username.slice(0, 2).toUpperCase()}</div>
            <h2>{user.username}</h2>
            <span className="pf-handle">{user.email}</span>
            <span className="pf-role">Patient</span>
            <p className="pf-since">Member since {memberSince}</p>
            <Link to="/appointments" className="pf-btn pf-btn-primary pf-block">View my appointments</Link>
          </div>
        </aside>

        <div className="pf-main">
          <section className="pf-card">
            <h2>Account information</h2>
            <p className="pf-card-sub">These details come from your account.</p>

            <div className="pf-grid">
              <div className="pf-field">
                <label htmlFor="p-user">Username</label>
                <input id="p-user" className="pf-input" value={user.username} readOnly />
              </div>
              <div className="pf-field">
                <label htmlFor="p-email">Email</label>
                <input id="p-email" className="pf-input" value={user.email} readOnly />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}