import { useContext } from 'react'
import { AdminContext } from '../context/AdminContext'

export function useAdmin() {
  return useContext(AdminContext)
}