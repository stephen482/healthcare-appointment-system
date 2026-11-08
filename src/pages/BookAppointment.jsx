import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api'
import '../styles/BookAppointment.css'

const SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
]

const pad = (n) => String(n).padStart(2, '0')
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
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

  if (failed) return <div className="bp-avatar bp-avatar-fallback">{initials}</div>
  return <img className="bp-avatar" src={photoFor(id)} alt={name} onError={() => setFailed(true)} />
}

export default function BookAppointment() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()

  // Doctors from Django
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [attempt, setAttempt] = useState(0)

  // Form
  const today = toISO(new Date())
  const [date, setDate] = useState(() => {
    const now = new Date()
    if (now.getHours() * 60 + now.getMinutes() >= 16 * 60 + 30) {
      now.setDate(now.getDate() + 1)
    }
    return toISO(now)
  })
  const [slot, setSlot] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [saved, setSaved] = useState(null)

  useEffect(() => {
    let cancelled = false

    api
      .get('/api/doctors/', { auth: false })
      .then((data) => {
        if (!cancelled) {
          setDoctors(data)
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

  const availableDoctors = useMemo(() => doctors.filter((d) => d.is_available), [doctors])
  const specialties = useMemo(
    () => [...new Set(availableDoctors.map((d) => d.specialty))].sort(),
    [availableDoctors]
  )

  const requestedId = Number(params.get('doctor'))
  const doctor = availableDoctors.find((d) => d.id === requestedId) || availableDoctors[0]
  const requestedUnavailable =
    requestedId && doctors.length > 0 && !availableDoctors.some((d) => d.id === requestedId)

  // Times that have already passed today cannot be picked.
  // Slots taken by other patients are rejected by the backend with a clear message.
  const slotState = useMemo(() => {
    const now = new Date()
    const nowTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`
    return SLOTS.map((time) => ({
      time,
      disabled: date === today && time <= nowTime,
    }))
  }, [date, today])

  const freeCount = slotState.filter((s) => !s.disabled).length

  const changeDoctor = (id) => {
    setParams({ doctor: id })
    setSlot('')
    setError('')
  }

  const changeDate = (value) => {
    setDate(value)
    setSlot('')
    setError('')
  }

  const handleConfirm = async (e) => {
    e.preventDefault()

    if (!date || date < today) {
      setError('Please choose today or a future date.')
      return
    }
    if (!slot) {
      setError('Please select a time slot.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const booking = await api.post('/api/appointments/', {
        doctor: doctor.id,
        appointment_date: date,
        appointment_time: slot,
        reason: reason.trim(),
      })
      setSaved(booking)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      const slotTaken = err.data && (err.data.appointment_time || err.data.non_field_errors)
      if (slotTaken) {
        setError('That time is already booked for this doctor. Please choose another time.')
        setSlot('')
      } else {
        setError(err.message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const bookAnother = () => {
    setSaved(null)
    setSlot('')
    setReason('')
    setError('')
  }

  // ---------- Loading and error screens ----------

  if (loading) {
    return (
      <div className="bp-page">
        <div className="bp-success">
          <h1>Loading doctors...</h1>
          <p>Please wait a moment.</p>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="bp-page">
        <div className="bp-success">
          <h1>We couldn&apos;t load the doctors</h1>
          <p>{loadError}</p>
          <div className="bp-success-actions">
            <button className="bp-btn bp-btn-primary" onClick={retry}>Try again</button>
          </div>
        </div>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="bp-page">
        <div className="bp-success">
          <h1>No doctors available</h1>
          <p>No doctor is accepting appointments right now. Please check back later.</p>
          <div className="bp-success-actions">
            <Link to="/doctors" className="bp-btn bp-btn-primary">See all doctors</Link>
          </div>
        </div>
      </div>
    )
  }

  // ---------- Success screen (the booking Django returned) ----------

  if (saved) {
    return (
      <div className="bp-page">
        <div className="bp-success">
          <div className="bp-success-icon">✓</div>
          <h1>Appointment confirmed!</h1>
          <p>Your visit has been saved. A summary is below.</p>

          <div className="bp-summary">
            <div className="bp-summary-doc">
              <Avatar id={saved.doctor} name={saved.doctor_name} />
              <div>
                <strong>{saved.doctor_name}</strong>
                <span>{saved.doctor_specialty}</span>
              </div>
            </div>
            <div className="bp-summary-row"><span>Date</span><strong>{formatDate(saved.appointment_date)}</strong></div>
            <div className="bp-summary-row"><span>Time</span><strong>{saved.appointment_time.slice(0, 5)}</strong></div>
            <div className="bp-summary-row"><span>Status</span><strong>{saved.status}</strong></div>
            {saved.reason && (
              <div className="bp-summary-row"><span>Reason</span><strong>{saved.reason}</strong></div>
            )}
          </div>

          <div className="bp-success-actions">
            <Link to="/appointments" className="bp-btn bp-btn-primary">View My Appointments</Link>
            <button className="bp-btn bp-btn-ghost" onClick={bookAnother}>Book another</button>
          </div>
        </div>
      </div>
    )
  }

  // ---------- Booking form ----------

  return (
    <div className="bp-page">
      <header className="bp-header">
        <span className="bp-eyebrow">SCHEDULING</span>
        <h1>Book an Appointment</h1>
        <p>Secure your consultation with our leading specialists in a few simple steps.</p>
        {requestedUnavailable && (
          <p className="bp-notice">The doctor you picked is not accepting appointments right now, so we chose another one.</p>
        )}
      </header>

      <div className="bp-grid">
        <aside className="bp-left">
          <div className="bp-doctor">
            <div className="bp-doctor-circle" />

            <div className="bp-doctor-top">
              <Avatar id={doctor.id} name={doctor.name} />
              <div>
                <span className="bp-available"><i /> Available</span>
                <h2>{doctor.name}</h2>
                <span className="bp-role">{doctor.specialty}</span>
              </div>
            </div>

            <p className="bp-bio">{doctor.bio}</p>

            <div className="bp-stats">
              <div>
                <span>SPECIALTY</span>
                <strong>{doctor.specialty}</strong>
              </div>
              <div>
                <span>STATUS</span>
                <strong>Accepting bookings</strong>
              </div>
            </div>
          </div>
        </aside>

        <form className="bp-form" onSubmit={handleConfirm}>
          <div className="bp-field">
            <label htmlFor="bp-doctor">Choose doctor</label>
            <select
              id="bp-doctor"
              className="bp-input"
              value={doctor.id}
              onChange={(e) => changeDoctor(e.target.value)}
            >
              {specialties.map((s) => (
                <optgroup key={s} label={s}>
                  {availableDoctors
                    .filter((d) => d.specialty === s)
                    .map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="bp-field">
            <label htmlFor="bp-date">Appointment Date</label>
            <input
              id="bp-date"
              type="date"
              className="bp-input"
              value={date}
              min={today}
              onChange={(e) => changeDate(e.target.value)}
            />
            <small>You cannot book a date in the past.</small>
          </div>

          <div className="bp-field">
            <div className="bp-label-row">
              <label>Select Time Slot</label>
              <span className="bp-free">{freeCount} slots open</span>
            </div>
            <div className="bp-slots">
              {slotState.map((s) => (
                <button
                  key={s.time}
                  type="button"
                  disabled={s.disabled}
                  className={'bp-slot' + (slot === s.time ? ' active' : '')}
                  onClick={() => { setSlot(s.time); setError('') }}
                >
                  {s.time}
                </button>
              ))}
            </div>
            {freeCount === 0 && <small>No times left today. Please pick another date.</small>}
          </div>

          <div className="bp-field">
            <label htmlFor="bp-reason">
              Reason for visit <span className="bp-optional">(optional)</span>
            </label>
            <textarea
              id="bp-reason"
              className="bp-input bp-textarea"
              rows="4"
              maxLength={300}
              placeholder="Briefly describe your reason for visit..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <small className="bp-count">{reason.length}/300</small>
          </div>

          {error && <div className="bp-error" role="alert">⚠ {error}</div>}

          <div className="bp-actions">
            <button type="submit" className="bp-btn bp-btn-primary bp-confirm" disabled={submitting}>
              {submitting ? 'Booking...' : '✓ Confirm Booking'}
            </button>
            <button type="button" className="bp-btn bp-btn-ghost" onClick={() => navigate('/doctors')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}