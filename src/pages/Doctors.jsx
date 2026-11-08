import { useState, useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api'
import '../styles/Doctors.css'

const PAGE_SIZE = 12

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

  if (failed) return <div className="dr-avatar dr-avatar-fallback">{initials}</div>
  return (
    <img
      className="dr-avatar"
      src={photoFor(id)}
      alt={name}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}

export default function Doctors() {
  const [params, setParams] = useSearchParams()
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  const [query, setQuery] = useState('')
  const [onlyAvailable, setOnlyAvailable] = useState(false)
  const [visible, setVisible] = useState(PAGE_SIZE)

  const specialty = params.get('specialty') || 'All'

  // Load the doctors from Django. Runs again when "Try again" is pressed.
  useEffect(() => {
    let cancelled = false

    api
      .get('/api/doctors/', { auth: false })
      .then((data) => {
        if (!cancelled) {
          setDoctors(data)
          setError('')
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
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
    setError('')
    setAttempt((a) => a + 1)
  }

  const setSpecialty = (value) => {
    if (value === 'All') setParams({})
    else setParams({ specialty: value })
  }

  // The specialty list comes from the real doctors.
  const specialties = useMemo(
    () => [...new Set(doctors.map((d) => d.specialty))].sort(),
    [doctors]
  )

  const counts = useMemo(() => {
    const c = { All: doctors.length }
    specialties.forEach((s) => {
      c[s] = doctors.filter((d) => d.specialty === s).length
    })
    return c
  }, [doctors, specialties])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return doctors.filter((d) => {
      const matchesSpecialty = specialty === 'All' || d.specialty === specialty
      const matchesAvailable = !onlyAvailable || d.is_available
      const matchesQuery =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.specialty.toLowerCase().includes(q) ||
        d.bio.toLowerCase().includes(q)
      return matchesSpecialty && matchesAvailable && matchesQuery
    })
  }, [doctors, query, specialty, onlyAvailable])

  // Go back to the first page whenever the filters change.
  useEffect(() => {
    setVisible(PAGE_SIZE)
  }, [query, specialty, onlyAvailable])

  const clearAll = () => {
    setQuery('')
    setOnlyAvailable(false)
    setParams({})
  }

  const hasFilters = query || onlyAvailable || specialty !== 'All'
  const shown = filtered.slice(0, visible)

  return (
    <div className="dr-page">
      <div className="dr-header">
        <div>
          <span className="dr-eyebrow">EXPERT MEDICAL STAFF</span>
          <h1>Our Doctors</h1>
          <p>
            Connect with world-class specialists dedicated to providing compassionate,
            evidence-based care tailored to your unique health needs.
          </p>
        </div>

        <div className="dr-tools">
          <div className="dr-search">
            <span className="dr-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search doctors by name, specialty..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search doctors"
            />
            {query && (
              <button className="dr-search-clear" onClick={() => setQuery('')} aria-label="Clear search">✕</button>
            )}
          </div>

          <select
            className="dr-select"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            aria-label="Filter by specialty"
          >
            <option value="All">All Specialties</option>
            {specialties.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="dr-empty">
          <div className="dr-empty-icon">⏳</div>
          <h3>Loading doctors...</h3>
          <p>Please wait a moment.</p>
        </div>
      )}

      {!loading && error && (
        <div className="dr-empty">
          <div className="dr-empty-icon">⚠️</div>
          <h3>We couldn&apos;t load the doctors</h3>
          <p>{error}</p>
          <button className="dr-book dr-empty-btn" onClick={retry}>Try again</button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="dr-chips">
            {['All', ...specialties].map((s) => (
              <button
                key={s}
                className={'dr-chip' + (specialty === s ? ' active' : '')}
                onClick={() => setSpecialty(s)}
              >
                {s} <span>{counts[s]}</span>
              </button>
            ))}
          </div>

          <div className="dr-resultbar">
            <p>
              Showing <strong>{shown.length}</strong> of <strong>{filtered.length}</strong>{' '}
              {filtered.length === 1 ? 'doctor' : 'doctors'}
              {specialty !== 'All' && <> in <strong>{specialty}</strong></>}
            </p>
            <div className="dr-resultbar-right">
              <label className="dr-toggle">
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                />
                Available only
              </label>
              {hasFilters && <button className="dr-clear" onClick={clearAll}>Clear all</button>}
            </div>
          </div>

          {filtered.length > 0 ? (
            <>
              <div className="dr-grid">
                {shown.map((d) => (
                  <article className="dr-card" key={d.id}>
                    <div className="dr-card-top">
                      <Avatar id={d.id} name={d.name} />
                      <span className={'dr-badge ' + (d.is_available ? 'on' : 'off')}>
                        <i /> {d.is_available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>

                    <span className="dr-title">{d.specialty}</span>
                    <h3>{d.name}</h3>
                    <p className="dr-bio">{d.bio}</p>

                    {d.is_available ? (
                      <Link to={`/book?doctor=${d.id}`} className="dr-book">📅 Book Appointment</Link>
                    ) : (
                      <button className="dr-book disabled" disabled>🚫 Book Appointment</button>
                    )}
                  </article>
                ))}
              </div>

              {visible < filtered.length && (
                <div className="dr-more-wrap">
                  <button className="dr-more" onClick={() => setVisible(visible + PAGE_SIZE)}>
                    Load more doctors ({filtered.length - visible} left)
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="dr-empty">
              <div className="dr-empty-icon">🩺</div>
              <h3>No doctors found</h3>
              <p>Try a different name or specialty, or clear your filters.</p>
              <button className="dr-book dr-empty-btn" onClick={clearAll}>Clear filters</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}