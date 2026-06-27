import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('arc_admin_session')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const signIn = async (email, password) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800))

    const adminUser = import.meta.env.VITE_ADMIN_USERNAME
    const adminPass = import.meta.env.VITE_ADMIN_PASSWORD

    if (!adminUser || !adminPass) {
      throw new Error('Admin credentials not configured in .env file')
    }

    if (email === adminUser && password === adminPass) {
      const sessionUser = { email, role: 'admin' }
      setUser(sessionUser)
      localStorage.setItem('arc_admin_session', JSON.stringify(sessionUser))
      return { user: sessionUser }
    } else {
      throw new Error('Invalid email or password')
    }
  }

  const signOut = async () => {
    setUser(null)
    localStorage.removeItem('arc_admin_session')
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}
