import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import '../styles/Info.css'

const PAGES = {
  '/privacy': {
    eyebrow: 'LEGAL',
    title: 'Privacy Policy',
    intro: 'MediBook is an educational project. This page explains, in plain language, how the demo handles your information.',
    sections: [
      ['What we store', 'Your account details, profile information and appointments are saved only in your own browser (localStorage). Nothing is sent to a server.'],
      ['Fictional data', 'All doctors, clinics, ratings and reviews on this site are made up and do not represent real people or places.'],
      ['Your choices', 'You can edit your profile at any time, cancel appointments, or clear all saved data by clearing your browser storage.'],
      ['Passwords', 'Because this is a demo, passwords are kept in the browser and are not encrypted. Please do not reuse a real password.'],
    ],
  },
  '/terms': {
    eyebrow: 'LEGAL',
    title: 'Terms of Service',
    intro: 'By using MediBook you agree to the simple terms below.',
    sections: [
      ['Demo use only', 'MediBook is a learning project. It does not provide medical advice, diagnosis or real appointments.'],
      ['Emergencies', 'If you have a medical emergency, contact your local emergency number or go to the nearest hospital immediately.'],
      ['Accounts', 'Keep your login details to yourself. Doctor accounts require a valid staff ID and each staff ID can be used once.'],
      ['Changes', 'These terms may change as the project develops.'],
    ],
  },
}

function Contact() {
  const [f, setF] = useState({ name: '', email: '', message: '' })
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setError('') }

  const submit = (e) => {
    e.preventDefault()
    if (!f.name.trim()) return setError('Please enter your name.')
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) return setError('Please enter a valid email.')
    if (f.message.trim().length < 10) return setError('Please write a message of at least 10 characters.')
    setSent(true)
  }

  return (
    <div className="in-page">
      <header className="in-head">
        <span className="in-eyebrow">SUPPORT</span>
        <h1>Contact Support</h1>
        <p>Have a question about MediBook? Send us a message.</p>
      </header>

      <div className="in-contact">
        <div className="in-card">
          {sent ? (
            <div className="in-sent">
              <div className="in-tick">✓</div>
              <h2>Message sent</h2>
              <p>Thanks, {f.name.trim()}. This is a demo, so no email was actually sent.</p>
              <button className="in-btn" onClick={() => { setSent(false); setF({ name: '', email: '', message: '' }) }}>
                Send another
              </button>
            </div>
          ) : (
            <form onSubmit={submit}>
              <div className="in-field">
                <label htmlFor="c-name">Your name</label>
                <input id="c-name" className="in-input" value={f.name} onChange={set('name')} />
              </div>
              <div className="in-field">
                <label htmlFor="c-email">Email</label>
                <input id="c-email" className="in-input" type="email" value={f.email} onChange={set('email')} />
              </div>
              <div className="in-field">
                <label htmlFor="c-msg">Message</label>
                <textarea id="c-msg" className="in-input in-textarea" rows="5" value={f.message} onChange={set('message')} />
              </div>
              {error && <div className="in-error" role="alert">⚠ {error}</div>}
              <button type="submit" className="in-btn">Send message</button>
            </form>
          )}
        </div>

        <aside className="in-card in-side">
          <h2>Other ways to reach us</h2>
          <p><strong>Email</strong><br />support@medibook.example</p>
          <p><strong>Phone</strong><br />+234 800 000 0000</p>
          <p><strong>Hours</strong><br />Monday to Friday, 8am to 6pm</p>
          <p className="in-note">These contact details are fictional.</p>
        </aside>
      </div>
    </div>
  )
}

export default function Info() {
  const { pathname } = useLocation()
  if (pathname === '/contact') return <Contact />

  const page = PAGES[pathname] || PAGES['/privacy']

  return (
    <div className="in-page">
      <header className="in-head">
        <span className="in-eyebrow">{page.eyebrow}</span>
        <h1>{page.title}</h1>
        <p>{page.intro}</p>
      </header>

      <div className="in-card in-doc">
        {page.sections.map(([title, text]) => (
          <section key={title}>
            <h2>{title}</h2>
            <p>{text}</p>
          </section>
        ))}
        <Link to="/" className="in-btn in-back">Back to home</Link>
      </div>
    </div>
  )
}