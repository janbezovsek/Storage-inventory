import { useState } from 'react'
import { AdminContext } from './AdminContext'

export function AdminProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false)

  const login = (password) => {
    if (password === 'admin123') {
      setIsAdmin(true)
      return true
    }
    return false
  }

  const logout = () => setIsAdmin(false)

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AdminContext.Provider>
  )
}