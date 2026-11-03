import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import '../styles/MyAppointments.css'

const KEY = 'medibook_appointments'
const TABS = ['All', 'Upcoming', 'Past', 'Cancelled']

function loadAppointments() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || []
  } catch {
    return []
  }
}

function saveAppointments(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    /* storage unavailable */
  }
}

function getStatus(a) {
  if (a.status === 'Cancelled') return 'Cancelled'
  return new Date(`${a.date}T${a.time}`) < new Date() ? 'Past' : 'Upcoming'
}

function dateParts(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return {
    month: date.toLocaleDateString('en-US', { month: 'short' }),
    day: d,
    full: date.toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    }),
  }
}

function Avatar({ name, img }) {
  const [failed, setFailed] = useState(false)
  const initials = name.replace('Dr. ', '').split(' ').map((w) => w[0]).join('')

  if (failed || !img) return <div className="ma-avatar ma-avatar-fallback">{initials}</div>
  return <img className="ma-avatar" src={img} alt={name} onError={() => setFailed(true)} />
}

export default function MyAppointments() {
  const [list, setList] = useState(loadAppointments)
  const [tab, setTab] = useState('All')
  const [toCancel, setToCancel] = useState(null)

  const items = useMemo(() => list.map((a) => ({ ...a, state: getStatus(a) })), [list])

  const counts = useMemo(() => {
    const c = { All: items.length, Upcoming: 0, Past: 0, Cancelled: 0 }
    items.forEach((a) => { c[a.state] += 1 })
    return c
  }, [items])

  const visible = useMemo(() => {
    const filtered = tab === 'All' ? items : items.filter((a) => a.state === tab)
    return [...filtered].sort((a, b) => {
      const ta = new Date(`${a.date}T${a.time}`)
      const tb = new Date(`${b.date}T${b.time}`)
      return tab === 'Upcoming' ? ta - tb : tb - ta
    })
  }, [items, tab])

  const next = items
    .filter((a) => a.state === 'Upcoming')
    .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))[0]

  const update = (updated) => {
    setList(updated)
    saveAppointments(updated)
  }

  const confirmCancel = () => {
    update(list.map((a) => (a.id === toCancel.id ? { ...a, status: 'Cancelled' } : a)))
    setToCancel(null)
  }

  const remove = (id) => update(list.filter((a) => a.id !== id))

  return (
    <div className="ma-page">
      <header className="ma-header">
        <div>
          <span className="ma-eyebrow">YOUR VISITS</span>
          <h1>My Appointments</h1>
          <p>View, manage and rebook your appointments in one place.</p>
        </div>
        <Link to="/book" className="ma-btn ma-btn-primary">+ New Appointment</Link>
      </header>

      <div className="ma-summary">
        <div className="ma-sum-card"><span>Upcoming</span><strong>{counts.Upcoming}</strong></div>
        <div className="ma-sum-card"><span>Completed</span><strong>{counts.Past}</strong></div>
        <div className="ma-sum-card"><span>Cancelled</span><strong>{counts.Cancelled}</strong></div>
        <div className="ma-sum-card ma-sum-next">
          <span>Next visit</span>
          <strong>
            {next ? `${dateParts(next.date).month} ${dateParts(next.date).day} · ${next.time}` : 'None booked'}
          </strong>
        </div>
      </div>

      <div className="ma-tabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={'ma-tab' + (tab === t ? ' active' : '')}
            onClick={() => setTab(t)}
          >
            {t} <span>{counts[t]}</span>
          </button>
        ))}
      </div>

      {visible.length > 0 ? (
        <div className="ma-list">
          {visible.map((a) => {
            const p = dateParts(a.date)
            return (
              <article className={'ma-card ma-' + a.state.toLowerCase()} key={a.id}>
                <div className="ma-date">
                  <span>{p.month}</span>
                  <strong>{p.day}</strong>
                </div>

                <div className="ma-main">
                  <div className="ma-doc">
                    <Avatar name={a.doctorName} img={a.img} />
                    <div>
                      <h3>{a.doctorName}</h3>
                      <span className="ma-role">{a.title || a.specialty}</span>
                    </div>
                    <span className={'ma-status ma-status-' + a.state.toLowerCase()}>
                      <i /> {a.state === 'Past' ? 'Completed' : a.state}
                    </span>
                  </div>

                  <div className="ma-details">
                    <div><span>🗓️</span> {p.full}</div>
                    <div><span>🕒</span> {a.time}</div>
                    <div><span>📍</span> {a.clinic}</div>
                  </div>

                  {a.reason && (
                    <p className="ma-reason"><strong>Reason:</strong> {a.reason}</p>
                  )}

                  <div className="ma-actions">
                    {a.state === 'Upcoming' ? (
                      <>
                        <Link to={`/book?doctor=${a.doctorId}`} className="ma-btn ma-btn-ghost">Reschedule</Link>
                        <button className="ma-btn ma-btn-danger" onClick={() => setToCancel(a)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <Link to={`/book?doctor=${a.doctorId}`} className="ma-btn ma-btn-primary">Book again</Link>
                        <button className="ma-btn ma-btn-ghost" onClick={() => remove(a.id)}>Remove</button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="ma-empty">
          <div className="ma-empty-icon">🗂️</div>
          <h3>{items.length === 0 ? 'No appointments yet' : `No ${tab.toLowerCase()} appointments`}</h3>
          <p>
            {items.length === 0
              ? 'Book your first visit with one of our specialists.'
              : 'Nothing to show in this tab.'}
          </p>
          <Link to="/doctors" className="ma-btn ma-btn-primary">Find a Doctor</Link>
        </div>
      )}

      {toCancel && (
        <div className="ma-overlay" onClick={() => setToCancel(null)}>
          <div className="ma-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ma-modal-icon">⚠️</div>
            <h3>Cancel this appointment?</h3>
            <p>
              {toCancel.doctorName} on {dateParts(toCancel.date).full} at {toCancel.time}.
            </p>
            <div className="ma-modal-actions">
              <button className="ma-btn ma-btn-ghost" onClick={() => setToCancel(null)}>Keep it</button>
              <button className="ma-btn ma-btn-danger-solid" onClick={confirmCancel}>Yes, cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}