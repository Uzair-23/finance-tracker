import axios from 'axios'

// Vite exposes env vars on import.meta.env. Replace any process.env usage
// to avoid "process is not defined" in the browser.
const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api'
const api = axios.create({ baseURL: baseUrl })

const setToken = (token) => {
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  else delete api.defaults.headers.common['Authorization']
}

export default Object.assign(api, { setToken })