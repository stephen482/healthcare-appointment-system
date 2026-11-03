import { useState, useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { doctors, specialties } from '../data/doctors'
import '../styles/Doctors.css'

const PAGE_SIZE = 12

function Avatar({ name, img }) {
  const [failed, setFailed] = useState(false)
  const initials = name.replace('Dr. ', '').split(' ').map((w) => w[0]).join('')

  if (failed) return <div className="dr-avatar dr-avatar-fallback">{initials}</div>
  return (
    <img
      className="dr-avatar"
      src={img}
      alt={name}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}

export default function Doctors() {
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [onlyAvailable, setOnlyAvailable] = useState(false)
  const [visible, setVisible] = useState(PAGE_SIZE)

  const specialty = params.get('specialty') || 'All'

  const setSpecialty = (value) => {
    if (value === 'All') setParams({})
    else setParams({ specialty: value })
  }

  const counts = useMemo(() => {
    const c = { All: doctors.length }
    specialties.forEach((s) => (c[s] = doctors.filter((d) => d.specialty === s).length))
    return c
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return doctors.filter((d) => {
      const matchesSpecialty = specialty === 'All' || d.specialty === specialty
      const matchesAvailable = !onlyAvailable || d.available
      const matchesQuery =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.specialty.toLowerCase().includes(q) ||
        d.title.toLowerCase().includes(q) ||
        d.bio.toLowerCase().includes(q)
      return matchesSpecialty && matchesAvailable && matchesQuery
    })
  }, [query, specialty, onlyAvailable])

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
                  <Avatar name={d.name} img={d.img} />
                  <span className={'dr-badge ' + (d.available ? 'on' : 'off')}>
                    <i /> {d.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>

                <span className="dr-title">{d.title}</span>
                <h3>{d.name}</h3>
                <p className="dr-bio">{d.bio}</p>

                {d.available ? (
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
    </div>
  )
}