import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import '../styles/MyAppointments.css'

const TABS = ['All', 'Upcoming', 'Past', 'Cancelled']

// Django stores booked / cancelled / completed.
// A booked appointment whose time has passed is shown as "Past".
function stateOf(a) {
  if (a.status === 'cancelled') return 'Cancelled'
  if (a.status === 'completed') return 'Past'
  const when = new Date(`${a.appointment_date}T${a.appointment_time}`)
  return when < new Date() ? 'Past' : 'Upcoming'
}

function whenOf(a) {
  return new Date(`${a.appointment_date}T${a.appointment_time}`)
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

// Fictional portrait for each doctor, based on the doctor's id.
function photoFor(id) {
  const female = id % 2 === 1
  const k = Math.floor((id - 1) / 2) % 100
  return `https://randomuser.me/api/portraits/${female ? 'women' : 'men'}/${k}.jpg`
}

function Avatar({ id, name }) {
  const [failed, setFailed] = useState(false)
  const initials = name
    .replace(/^dr\.?\s/i, '')
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  if (failed) return <div className="ma-avatar ma-avatar-fallback">{initials}</div>
  return <img className="ma-avatar" src={photoFor(id)} alt={name} onError={() => setFailed(true)} />
}

export default function MyAppointments() {
  const [all, setAll] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [attempt, setAttempt] = useState(0)

  const [tab, setTab] = useState('All')
  const [toCancel, setToCancel] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState('')

  // Load this patient's appointments from Django.
  useEffect(() => {
    let cancelled = false

    api
      .get('/api/appointments/')
      .then((data) => {
        if (!cancelled) {
          setAll(data)
          setLoadError('')
        }
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [attempt])

  const retry = () => {
    setLoading(true)
    setLoadError('')
    setAttempt((a) => a + 1)
  }

  const items = useMemo(() => all.map((a) => ({ ...a, state: stateOf(a) })), [all])

  const counts = useMemo(() => {
    const c = { All: items.length, Upcoming: 0, Past: 0, Cancelled: 0 }
    items.forEach((a) => { c[a.state] += 1 })
    return c
  }, [items])

  const visible = useMemo(() => {
    const filtered = tab === 'All' ? items : items.filter((a) => a.state === tab)
    return [...filtered].sort((a, b) =>
      tab === 'Upcoming' ? whenOf(a) - whenOf(b) : whenOf(b) - whenOf(a)
    )
  }, [items, tab])

  const next = items
    .filter((a) => a.state === 'Upcoming')
    .sort((a, b) => whenOf(a) - whenOf(b))[0]

  const closeModal = () => {
    setToCancel(null)
    setCancelError('')
  }

  // Cancel through the API, then update the list with what Django returns.
  const confirmCancel = async () => {
    setCancelling(true)
    setCancelError('')
    try {
      const updated = await api.patch(`/api/appointments/${toCancel.id}/`, { status: 'cancelled' })
      setAll((list) => list.map((a) => (a.id === updated.id ? updated : a)))
      closeModal()
    } catch (err) {
      setCancelError(err.message)
    } finally {
      setCancelling(false)
    }
  }

  // ---------- Loading and error ----------

  if (loading) {
    return (
      <div className="ma-page">
        <div className="ma-empty">
          <div className="ma-empty-icon">⏳</div>
          <h3>Loading your appointments...</h3>
          <p>Please wait a moment.</p>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="ma-page">
        <div className="ma-empty">
          <div className="ma-empty-icon">⚠️</div>
          <h3>We couldn&apos;t load your appointments</h3>
          <p>{loadError}</p>
          <button className="ma-btn ma-btn-primary" onClick={retry}>Try again</button>
        </div>
      </div>
    )
  }

  // ---------- Page ----------

  return (
    <div className="ma-page">
      <header className="ma-header">
        <div>
          <span className="ma-eyebrow">YOUR VISITS</span>
          <h1>My Appointments</h1>
          <p>View and manage your appointments in one place.</p>
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
            {next
              ? `${dateParts(next.appointment_date).month} ${dateParts(next.appointment_date).day} · ${next.appointment_time.slice(0, 5)}`
              : 'None booked'}
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
            const p = dateParts(a.appointment_date)
            return (
              <article className={'ma-card ma-' + a.state.toLowerCase()} key={a.id}>
                <div className="ma-date">
                  <span>{p.month}</span>
                  <strong>{p.day}</strong>
                </div>

                <div className="ma-main">
                  <div className="ma-doc">
                    <Avatar id={a.doctor} name={a.doctor_name} />
                    <div>
                      <h3>{a.doctor_name}</h3>
                      <span className="ma-role">{a.doctor_specialty}</span>
                    </div>
                    <span className={'ma-status ma-status-' + a.state.toLowerCase()}>
                      <i /> {a.state === 'Past' ? 'Completed' : a.state}
                    </span>
                  </div>

                  <div className="ma-details">
                    <div><span>🗓️</span> {p.full}</div>
                    <div><span>🕒</span> {a.appointment_time.slice(0, 5)}</div>
                    <div><span>🩺</span> {a.doctor_specialty}</div>
                  </div>

                  {a.reason && (
                    <p className="ma-reason"><strong>Reason:</strong> {a.reason}</p>
                  )}

                  <div className="ma-actions">
                    {a.state === 'Upcoming' ? (
                      <button className="ma-btn ma-btn-danger" onClick={() => setToCancel(a)}>Cancel</button>
                    ) : (
                      <Link to={`/book?doctor=${a.doctor}`} className="ma-btn ma-btn-primary">Book again</Link>
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
        <div className="ma-overlay" onClick={closeModal}>
          <div className="ma-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ma-modal-icon">⚠️</div>
            <h3>Cancel this appointment?</h3>
            <p>
              {toCancel.doctor_name} on {dateParts(toCancel.appointment_date).full} at{' '}
              {toCancel.appointment_time.slice(0, 5)}.
            </p>
            {cancelError && <p style={{ color: '#b42318' }}>⚠ {cancelError}</p>}
            <div className="ma-modal-actions">
              <button className="ma-btn ma-btn-ghost" onClick={closeModal} disabled={cancelling}>
                Keep it
              </button>
              <button className="ma-btn ma-btn-danger-solid" onClick={confirmCancel} disabled={cancelling}>
                {cancelling ? 'Cancelling...' : 'Yes, cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}