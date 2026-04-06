import { useState } from 'react'
import { AdminContext } from './AdminContext'
import { adminLogin } from '../services/api'

export function AdminProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [token, setToken] = useState(null)

  const login = async (username, password) => {
    try {
      const data = await adminLogin(username, password)
      setToken(data.token)
      setIsAdmin(true)
      return true
    } catch (err) {
      return false
    }
  }

  const logout = () => {
    setIsAdmin(false)
    setToken(null)
  }

  return (
    <AdminContext.Provider value={{ isAdmin, token, login, logout }}>
      {children}
    </AdminContext.Provider>
  )
}