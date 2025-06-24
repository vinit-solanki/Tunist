import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem("token")
    if (token) {
      // Verify token and get user info
      fetchUserProfile(token)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch("https://tunist-user-service.onrender.com/api/v1/user/me", {
        headers: {
          token: `${token}`,
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user || userData) // Handle different response structures
      } else {
        localStorage.removeItem("token")
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
      localStorage.removeItem("token")
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await fetch("https://tunist-user-service.onrender.com/api/v1/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("token", data.token)
        setUser(data.user)
        return data
      } else {
        throw new Error(data.message || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const register = async (name, email, password) => {
    try {
      const response = await fetch("https://tunist-user-service.onrender.com/api/v1/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("token", data.token)
        setUser(data.user)
        return data
      } else {
        throw new Error(data.message || "Registration failed")
      }
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
