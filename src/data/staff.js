import { doctors } from './doctors'

const KEY = 'medibook_appointments'
const pad = (n) => String(n).padStart(2, '0')

export const staffIdFor = (id) => `MB-DOC-${String(id).padStart(3, '0')}`

export const findDoctorByStaffId = (value) => {
  const sid = String(value || '').trim().toUpperCase()
  return doctors.find((d) => staffIdFor(d.id) === sid) || null
}

export const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export function readAppointments() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || []
  } catch {
    return []
  }
}

export function writeAppointments(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    /* storage unavailable */
  }
}

export function stateOf(a) {
  if (a.status === 'Cancelled') return 'Cancelled'
  if (a.status === 'Completed') return 'Completed'
  return new Date(`${a.date}T${a.time}`) < new Date() ? 'Completed' : 'Upcoming'
}

export function patientName(username) {
  try {
    const users = JSON.parse(localStorage.getItem('medibook_users')) || []
    const u = users.find((x) => x.username === username)
    return u ? u.fullName || username : username
  } catch {
    return username
  }
}

export function formatDay(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  })
}

export const drName = (name) => (/^dr\.?\s/i.test(name) ? name : `Dr. ${name}`)

export const initialsOf = (name) =>
  name.replace(/^dr\.?\s/i, '').split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase()