"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import api from "../services/api"
import { useToast } from "../hooks/use-toast"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const loadUser = useCallback(async () => {
    try {
      const token = localStorage.getItem("token")
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`
        const res = await api.get("/auth/me")
        setUser(res.data.user)
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error("Failed to load user:", error)
      localStorage.removeItem("token")
      localStorage.removeItem("refreshToken")
      setUser(null)
      setIsAuthenticated(false)
      // Optionally show a toast if the token was invalid
      if (error.response && error.response.status === 401) {
        toast({
          title: "Session Expired",
          description: "Please log in again.",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const login = async (email, password) => {
    setLoading(true)
    try {
      const res = await api.post("/auth/login", { email, password })
      localStorage.setItem("token", res.data.token)
      localStorage.setItem("refreshToken", res.data.refreshToken)
      api.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`
      setUser(res.data.user)
      setIsAuthenticated(true)
      toast({
        title: "Success!",
        description: "Logged in successfully.",
      })
      return true
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message)
      toast({
        title: "Login Failed",
        description: error.response?.data?.message || "An error occurred during login.",
        variant: "destructive",
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    setLoading(true)
    try {
      const res = await api.post("/auth/register", userData)
      toast({
        title: "Registration Successful",
        description: res.data.message,
      })
      return true
    } catch (error) {
      console.error("Registration failed:", error.response?.data || error.message)
      toast({
        title: "Registration Failed",
        description: error.response?.data?.message || "An error occurred during registration.",
        variant: "destructive",
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      const refreshToken = localStorage.getItem("refreshToken")
      if (refreshToken) {
        await api.post("/auth/logout", { token: refreshToken })
      }
      localStorage.removeItem("token")
      localStorage.removeItem("refreshToken")
      delete api.defaults.headers.common["Authorization"]
      setUser(null)
      setIsAuthenticated(false)
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      })
    } catch (error) {
      console.error("Logout failed:", error.response?.data || error.message)
      toast({
        title: "Logout Failed",
        description: error.response?.data?.message || "An error occurred during logout.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const refreshAccessToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken")
      if (!refreshToken) {
        throw new Error("No refresh token found")
      }
      const res = await api.post("/auth/refresh-token", { token: refreshToken })
      localStorage.setItem("token", res.data.token)
      api.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`
      return res.data.token
    } catch (error) {
      console.error("Token refresh failed:", error)
      logout() // Log out user if refresh fails
      throw error
    }
  }, [])

  // Axios interceptor for automatic token refresh
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true
          try {
            const newAccessToken = await refreshAccessToken()
            originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`
            return api(originalRequest)
          } catch (refreshError) {
            return Promise.reject(refreshError)
          }
        }
        return Promise.reject(error)
      },
    )

    return () => {
      api.interceptors.response.eject(interceptor)
    }
  }, [refreshAccessToken])

  const updateUser = (updatedUserData) => {
    setUser((prevUser) => ({ ...prevUser, ...updatedUserData }))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        updateUser,
        loadUser, // Expose loadUser for manual refresh if needed
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
