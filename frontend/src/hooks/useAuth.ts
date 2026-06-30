import { useState } from 'react'
import { User } from '@/lib/types'

const demoUser: User = {
  id: 1,
  username: 'admin',
  email: 'admin@apteka.com',
  full_name: 'Dr. Siddhartha Kumar',
  is_admin: true,
  created_at: new Date().toISOString(),
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(demoUser)
  const [token, setToken] = useState<string | null>('development-token')

  const login = async (username: string, password: string) => {
    console.log('Demo login', username, password)
    setUser(demoUser)
    setToken('development-token')
    return demoUser
  }

  const register = async (data: {
    username: string
    email: string
    password: string
    full_name?: string
  }) => {
    console.log('Demo register', data)
    return demoUser
  }

  const logout = () => {
    setUser(null)
    setToken(null)
  }

  return {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: true,
  }
}