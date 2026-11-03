import { useState, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { doctors, specialties } from '../data/doctors'
import { useAuth } from '../context/AuthContext'
import '../styles/BookAppointment.css'

const SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
]

const clinics = [
  { name: 'HeartCare Center, Suite 402', address: '742 Evergreen Terrace, Medical District' },
  { name: 'Little Steps Pediatric Clinic', address: '18 Maple Avenue, Family Quarter' },
  { name: 'ClearSkin Institute, Floor 2', address: '55 Rosewood Street, Medical District' },
  { name: 'NeuroLife Center, Suite 210', address: '301 Hillcrest Road, Health Park' },
  { name: 'BrightSmile Dental Studio', address: '9 Orchard Lane, Central Plaza' },
  { name: 'MoveWell Orthopedic Center', address: '120 Riverside Drive, Sports District' },
  { name: 'MediBook Family Clinic', address: '64 Union Street, Central Plaza' },
  { name: "Women's Health Pavilion", address: '27 Lotus Close, Medical District' },
  { name: 'ClearView Eye Center', address: '88 Vista Road, Health Park' },
  { name: 'ENT & Hearing Clinic', address: '14 Cedar Court, Medical District' },
  { name: 'MindWell Psychiatry Practice', address: '73 Calm Street, Garden Quarter' },
  { name: 'UroCare Specialists', address: '40 Bridge Road, Medical District' },
  { name: 'HopeBridge Cancer Center', address: '5 Unity Avenue, Health Park' },
  { name: 'Balance Endocrine Clinic', address: '96 Harmony Way, Central Plaza' },
]

/* ---------- helpers ---------- */
const pad = (n) => String(n).padStart(2, '0')

function toISO(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function getBookings() {
  try {
    return JSON.parse(localStorage.getItem('medibook_appointments')) || []
  } catch {
    return []
  }
}

function saveBooking(booking) {
  try {
    const all = getBookings()
    all.push(booking)
    localStorage.setItem('medibook_appointments', JSON.stringify(all))
  } catch {
    /* storage unavailable, ignore */
  }
}

function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
}

function Avatar({ name, img }) {
  const [failed, setFailed] = useState(false)
  const initials = name.replace('Dr. ', '').split(' ').map((w) => w[0]).join('')

  if (failed) return <div className="bp-avatar bp-avatar-fallback">{initials}</div>
  return <img className="bp-avatar" src={img} alt={name} onError={() => setFailed(true)} />
}

export default function BookAppointment() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()

  const today = toISO(new Date())
  const availableDoctors = useMemo(() => doctors.filter((d) => d.available), [])

  const requestedId = Number(params.get('doctor'))
  const doctor =
    availableDoctors.find((d) => d.id === requestedId) || availableDoctors[0]

  const [date, setDate] = useState(today)
  const [slot, setSlot] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(null)

  const rating = (4.5 + ((doctor.id * 3) % 5) / 10).toFixed(1)
  const reviews = 40 + ((doctor.id * 17) % 160)
  const clinic = clinics[specialties.indexOf(doctor.specialty)] || clinics[6]

  /* Work out which slots can't be picked */
  const slotState = useMemo(() => {
    const now = new Date()
    const nowTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`
    const day = Number(date.split('-')[2]) || 1
    const mine = getBookings()

    return SLOTS.map((time, i) => {
      const past = date === today && time <= nowTime
      const demoBusy = (doctor.id * 7 + day + i * 3) % 5 === 0
      const taken = mine.some(
        (b) => b.doctorId === doctor.id && b.date === date && b.time === time && b.status !== 'Cancelled'
      )
      return { time, disabled: past || demoBusy || taken }
    })
  }, [date, doctor.id, today, saved])

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

  const handleConfirm = (e) => {
    e.preventDefault()

    if (!date || date < today) {
      setError('Please choose today or a future date.')
      return
    }
    if (!slot) {
      setError('Please select a time slot.')
      return
    }

    const booking = {
      id: Date.now(),
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialty: doctor.specialty,
      title: doctor.title,
      img: doctor.img,
      clinic: clinic.name,
      address: clinic.address,
      date,
      time: slot,
      reason: reason.trim(),
      status: 'Upcoming',
      patient: user ? user.username : 'Guest',
    }

    saveBooking(booking)
    setSaved(booking)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const bookAnother = () => {
    setSaved(null)
    setSlot('')
    setReason('')
    setError('')
  }

  /* ---------- Success screen ---------- */
  if (saved) {
    return (
      <div className="bp-page">
        <div className="bp-success">
          <div className="bp-success-icon">✓</div>
          <h1>Appointment confirmed!</h1>
          <p>Your visit has been booked. A summary is below.</p>

          <div className="bp-summary">
            <div className="bp-summary-doc">
              <Avatar name={saved.doctorName} img={saved.img} />
              <div>
                <strong>{saved.doctorName}</strong>
                <span>{saved.title}</span>
              </div>
            </div>
            <div className="bp-summary-row"><span>Date</span><strong>{formatDate(saved.date)}</strong></div>
            <div className="bp-summary-row"><span>Time</span><strong>{saved.time}</strong></div>
            <div className="bp-summary-row"><span>Location</span><strong>{saved.clinic}</strong></div>
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

  /* ---------- Booking form ---------- */
  return (
    <div className="bp-page">
      <header className="bp-header">
        <span className="bp-eyebrow">SCHEDULING</span>
        <h1>Book an Appointment</h1>
        <p>Secure your consultation with our leading specialists in a few simple steps.</p>
      </header>

      <div className="bp-grid">
        {/* LEFT: doctor + location */}
        <aside className="bp-left">
          <div className="bp-doctor">
            <div className="bp-doctor-circle" />

            <div className="bp-doctor-top">
              <Avatar name={doctor.name} img={doctor.img} />
              <div>
                <span className="bp-available"><i /> Available Today</span>
                <h2>{doctor.name}</h2>
                <span className="bp-role">{doctor.title}</span>
              </div>
            </div>

            <p className="bp-bio">{doctor.bio}</p>

            <div className="bp-stats">
              <div>
                <span>EXPERIENCE</span>
                <strong>{doctor.years} Years</strong>
              </div>
              <div>
                <span>RATING</span>
                <strong><b className="bp-star">★</b> {rating} <small>({reviews} reviews)</small></strong>
              </div>
            </div>
          </div>

          <div className="bp-location">
            <div className="bp-pin">📍</div>
            <div>
              <strong>{clinic.name}</strong>
              <span>{clinic.address}</span>
            </div>
          </div>
        </aside>

        {/* RIGHT: form */}
        <form className="bp-form" onSubmit={handleConfirm}>
          <div className="bp-field">
            <label htmlFor="bp-doctor">Choose doctor</label>
            <select
              id="bp-doctor"
              className="bp-input"
              value={doctor.id}
              onChange={(e) => changeDoctor(e.target.value)}
            >
              {specialties.map((s) => {
                const list = availableDoctors.filter((d) => d.specialty === s)
                if (list.length === 0) return null
                return (
                  <optgroup key={s} label={s}>
                    {list.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </optgroup>
                )
              })}
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
              <span className="bp-free">{freeCount} slots free</span>
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
            {freeCount === 0 && <small>No free slots on this day. Please pick another date.</small>}
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
              placeholder="Briefly describe your symptoms or reason for visit..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <small className="bp-count">{reason.length}/300</small>
          </div>

          {error && <div className="bp-error" role="alert">⚠ {error}</div>}

          <div className="bp-actions">
            <button type="submit" className="bp-btn bp-btn-primary bp-confirm">
              ✓ Confirm Booking
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