// Central API settings and request helper.
// The backend address comes from the .env file (VITE_API_URL).
export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

const ACCESS_KEY = 'medibook_access'
const REFRESH_KEY = 'medibook_refresh'

export const getAccess = () => localStorage.getItem(ACCESS_KEY)
export const getRefresh = () => localStorage.getItem(REFRESH_KEY)

export function saveTokens({ access, refresh }) {
  if (access) localStorage.setItem(ACCESS_KEY, access)
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh)
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

export class ApiError extends Error {
  constructor(status, message, data) {
    super(message)
    this.status = status
    this.data = data
  }
}

// Turn Django's error reply into one readable sentence.
function messageFrom(data, status) {
  if (!data) return `Something went wrong (error ${status}).`
  if (typeof data === 'string') return data
  if (data.detail) return String(data.detail)

  const parts = []
  Object.values(data).forEach((value) => {
    if (Array.isArray(value)) parts.push(...value.map(String))
    else if (typeof value === 'string') parts.push(value)
  })
  return parts.length ? parts.join(' ') : `Something went wrong (error ${status}).`
}

async function readJson(response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}

// Ask Django for a new access token using the refresh token.
async function refreshAccess() {
  const refresh = getRefresh()
  if (!refresh) return false
  try {
    const response = await fetch(`${API_URL}/api/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    })
    if (!response.ok) return false
    const data = await readJson(response)
    if (!data || !data.access) return false
    saveTokens({ access: data.access })
    return true
  } catch {
    return false
  }
}

async function send(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getAccess()
  if (auth && token) headers.Authorization = `Bearer ${token}`

  return fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

export async function request(path, options = {}) {
  let response
  try {
    response = await send(path, options)

    // The access token expired: renew it once and try again.
    if (response.status === 401 && options.auth !== false && (await refreshAccess())) {
      response = await send(path, options)
    }
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Please check your connection and try again.')
  }

  const data = await readJson(response)

  if (!response.ok) {
    if (response.status === 401 && options.auth !== false) {
      // Session is really over: let the app know so it can log the user out.
      clearTokens()
      window.dispatchEvent(new Event('medibook:logout'))
    }
    throw new ApiError(response.status, messageFrom(data, response.status), data)
  }

  return data
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
}