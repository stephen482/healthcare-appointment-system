import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/Home.css'

const specialties = [
  { icon: '❤️', name: 'Cardiology' },
  { icon: '🧒', name: 'Pediatrics' },
  { icon: '🧴', name: 'Dermatology' },
  { icon: '🧠', name: 'Neurology' },
  { icon: '🦷', name: 'Dentistry' },
  { icon: '🦴', name: 'Orthopedics' },
]

const steps = [
  { num: '01', title: 'Find a doctor', text: 'Browse verified specialists by specialty, reviews, and clinical experience.' },
  { num: '02', title: 'Pick a time', text: 'Choose a date and time slot that fits your schedule.' },
  { num: '03', title: 'Get confirmed', text: 'Receive instant confirmation and track it under My Appointments.' },
]

const doctors = [
  { name: 'Dr. Sarah Jenkins', specialty: 'Cardiology', rating: 4.9, reviews: 128, experience: '12 Years', fee: '$120', img: '/images/doctor1.jpg' },
  { name: 'Dr. Michael Chen', specialty: 'Pediatrics', rating: 4.8, reviews: 96, experience: '9 Years', fee: '$100', img: '/images/doctor2.jpg' },
  { name: 'Dr. Emily Rodriguez', specialty: 'Dermatology', rating: 4.9, reviews: 142, experience: '15 Years', fee: '$150', img: '/images/doctor3.jpg' },
  { name: 'Dr. James Carter', specialty: 'Neurology', rating: 4.7, reviews: 88, experience: '11 Years', fee: '$140', img: '/images/doctor4.jpg' },
  { name: 'Dr. Aisha Bello', specialty: 'Dentistry', rating: 4.9, reviews: 110, experience: '8 Years', fee: '$90', img: '/images/doctor5.jpg' },
  { name: 'Dr. David Kim', specialty: 'Orthopedics', rating: 4.8, reviews: 75, experience: '14 Years', fee: '$130', img: '/images/doctor6.jpg' },
]

const quickLinks = [
  { to: '/doctors', icon: '👨‍⚕️', title: 'Find Doctors', text: 'Search and compare specialists.' },
  { to: '/book', icon: '📅', title: 'Book Appointment', text: 'Pick a doctor, date, and time.' },
  { to: '/appointments', icon: '🗂️', title: 'My Appointments', text: 'View, reschedule, or cancel visits.' },
  { to: '/profile', icon: '👤', title: 'My Profile', text: 'Update your personal details.' },
]

/* Fades an element in when it scrolls into view */
function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true)
          obs.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`hm-reveal ${show ? 'hm-show' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

/* Number that counts up from 0 */
function CountUp({ end, suffix = '', duration = 1800 }) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    let frame
    const start = performance.now()
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      setValue(Math.floor(progress * end))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [end, duration])

  return <>{value}{suffix}</>
}

/* Doctor photo with initials fallback */
function Avatar({ name, img }) {
  const [failed, setFailed] = useState(false)
  const initials = name.replace('Dr. ', '').split(' ').map((w) => w[0]).join('')

  if (failed) return <div className="hm-avatar hm-avatar-fallback">{initials}</div>
  return <img className="hm-avatar" src={img} alt={name} onError={() => setFailed(true)} />
}

function useVisibleCount() {
  const get = () => (window.innerWidth < 700 ? 1 : window.innerWidth < 1000 ? 2 : 3)
  const [count, setCount] = useState(get)

  useEffect(() => {
    const onResize = () => setCount(get())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return count
}

function DoctorCarousel() {
  const perView = useVisibleCount()
  const maxIndex = doctors.length - perView
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const current = Math.min(index, maxIndex)

  useEffect(() => {
    if (paused) return
    const timer = setInterval(() => {
      setIndex((i) => (i >= maxIndex ? 0 : i + 1))
    }, 3500)
    return () => clearInterval(timer)
  }, [paused, maxIndex])

  const prev = () => setIndex(current <= 0 ? maxIndex : current - 1)
  const next = () => setIndex(current >= maxIndex ? 0 : current + 1)

  return (
    <div
      className="hm-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="hm-carousel-viewport">
        <div
          className="hm-carousel-track"
          style={{ transform: `translateX(-${current * (100 / perView)}%)` }}
        >
          {doctors.map((d) => (
            <div className="hm-slide" key={d.name} style={{ flexBasis: `${100 / perView}%` }}>
              <div className="hm-doctor">
                <div className="hm-doctor-top">
                  <Avatar name={d.name} img={d.img} />
                  <div>
                    <h3>{d.name}</h3>
                    <span className="hm-specialty">{d.specialty}</span>
                    <div className="hm-rating">
                      <span className="hm-star">★</span> <strong>{d.rating}</strong> ({d.reviews} reviews)
                    </div>
                  </div>
                </div>
                <div className="hm-doctor-info">
                  <div><span>Experience</span><strong>{d.experience}</strong></div>
                  <div><span>Consultation Fee</span><strong>{d.fee}</strong></div>
                </div>
                <Link to="/book" className="hm-btn hm-btn-primary hm-btn-full">Book Appointment</Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="hm-carousel-controls">
        <button onClick={prev} aria-label="Previous doctors">‹</button>
        <div className="hm-dots">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              className={i === current ? 'active' : ''}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
        <button onClick={next} aria-label="Next doctors">›</button>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <div className="hm">
      {/* HERO */}
      <section className="hm-hero">
        <div className="hm-blob hm-blob-1" />
        <div className="hm-blob hm-blob-2" />

        <div className="hm-container hm-hero-grid">
          <div className="hm-hero-text">
            <span className="hm-badge hm-anim" style={{ '--d': '0ms' }}>
              <i className="hm-dot" /> Trusted Healthcare Platform
            </span>
            <h1 className="hm-anim" style={{ '--d': '120ms' }}>
              Your health, <span className="hm-gradient">booked in minutes</span>
            </h1>
            <p className="hm-anim" style={{ '--d': '240ms' }}>
              Find trusted healthcare professionals, schedule visits instantly,
              and manage your care from one simple place.
            </p>
            <div className="hm-hero-buttons hm-anim" style={{ '--d': '360ms' }}>
              <Link to="/doctors" className="hm-btn hm-btn-primary">Browse Doctors</Link>
              <Link to="/book" className="hm-btn hm-btn-outline">Book Appointment</Link>
            </div>

            <div className="hm-stats hm-anim" style={{ '--d': '480ms' }}>
              <div><strong><CountUp end={500} suffix="+" /></strong><span>Verified Doctors</span></div>
              <div><strong>24/7</strong><span>Instant Booking</span></div>
              <div><strong><CountUp end={100} suffix="k+" /></strong><span>Happy Patients</span></div>
            </div>
          </div>

          <div className="hm-visual hm-anim" style={{ '--d': '300ms' }}>
            <div className="hm-arch">
              <img
                src="/images/hero-doctor.jpg"
                alt="Friendly doctor"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            </div>

            <div className="hm-float hm-float-1">
              <span className="hm-float-icon">✅</span>
              <div>
                <strong>Appointment confirmed</strong>
                <small>Today · 2:30 PM</small>
              </div>
            </div>

            <div className="hm-float hm-float-2">
              <span className="hm-star">★</span>
              <div>
                <strong>4.9 rating</strong>
                <small>12k+ patient reviews</small>
              </div>
            </div>

            <div className="hm-float hm-float-3">
              <span className="hm-float-icon">🩺</span>
              <div>
                <strong>Next available</strong>
                <small>Dr. Jenkins · 2:30 PM</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SPECIALTIES */}
      <section className="hm-section">
        <div className="hm-container">
          <Reveal>
            <h2 className="hm-title">Browse by specialty</h2>
            <p className="hm-sub">Find the right expert for what you need.</p>
          </Reveal>
          <div className="hm-specialties">
            {specialties.map((s, i) => (
              <Reveal key={s.name} delay={i * 70}>
                <Link to="/doctors" className="hm-spec">
                  <span className="hm-spec-icon">{s.icon}</span>
                  <span>{s.name}</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="hm-section hm-alt">
        <div className="hm-container">
          <Reveal>
            <h2 className="hm-title">How it works</h2>
            <p className="hm-sub">Three simple steps to get the care you need.</p>
          </Reveal>
          <div className="hm-steps">
            {steps.map((s, i) => (
              <Reveal key={s.num} delay={i * 150}>
                <div className="hm-step">
                  <span className="hm-step-num">{s.num}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED DOCTORS CAROUSEL */}
      <section className="hm-section">
        <div className="hm-container">
          <Reveal>
            <div className="hm-head-row">
              <div>
                <h2 className="hm-title hm-left">Featured doctors</h2>
                <p className="hm-sub hm-left">Consult with top-rated experts across multiple specialties.</p>
              </div>
              <Link to="/doctors" className="hm-link">View all doctors →</Link>
            </div>
          </Reveal>
          <Reveal delay={150}>
            <DoctorCarousel />
          </Reveal>
        </div>
      </section>

      {/* QUICK ACCESS */}
      <section className="hm-section hm-alt">
        <div className="hm-container">
          <Reveal>
            <h2 className="hm-title">Where would you like to go?</h2>
            <p className="hm-sub">Jump straight to what you need.</p>
          </Reveal>
          <div className="hm-quick">
            {quickLinks.map((q, i) => (
              <Reveal key={q.to} delay={i * 100}>
                <Link to={q.to} className="hm-quick-card">
                  <span className="hm-quick-icon">{q.icon}</span>
                  <h3>{q.title}</h3>
                  <p>{q.text}</p>
                  <span className="hm-quick-arrow">→</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}