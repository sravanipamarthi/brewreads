import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Restore session from localStorage
    const storedUser  = localStorage.getItem('brewreads_user')
    const storedToken = localStorage.getItem('token')
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const loginUser = (userData, token) => {
    setUser(userData)
    localStorage.setItem('brewreads_user', JSON.stringify(userData))
    localStorage.setItem('token', token)
  }

  const logoutUser = () => {
    setUser(null)
    localStorage.removeItem('brewreads_user')
    localStorage.removeItem('token')
    localStorage.removeItem('spotify_token')
    sessionStorage.removeItem('brewreads_books')
    sessionStorage.removeItem('brewreads_reading')
    sessionStorage.removeItem('brewreads_description')
    sessionStorage.removeItem('brewreads_pending_mood')
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}