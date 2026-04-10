const BASE_URL = import.meta.env.VITE_API_URL || '/api'

// ── Items ──────────────────────────────────────────────────────

export async function fetchItems() {
  const res = await fetch(`${BASE_URL}/items`)
  if (!res.ok) throw new Error('Failed to fetch items')
  return res.json()
}

export async function importItemsFromExcel(file, token) {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${BASE_URL}/items/import`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
  if (!res.ok) throw new Error('Import failed')
  return res.json()
}

export async function uploadItemPhoto(itemId, file, token) {
  const formData = new FormData()
  formData.append('photo', file)

  const res = await fetch(`${BASE_URL}/items/${itemId}/photo`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
  if (!res.ok) throw new Error('Photo upload failed')
  return res.json()
}

export async function deleteItemPhoto(photoId, token) {
  const res = await fetch(`${BASE_URL}/items/photo/${photoId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Photo delete failed')
  return res.json()
}

// ── Auth ───────────────────────────────────────────────────────

export async function adminLogin(username, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) throw new Error('Invalid credentials')
  return res.json() // returns { token }
}