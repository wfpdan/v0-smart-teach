"use client"

import { useState, useEffect, createContext, useContext, type ReactNode } from "react"
import {
  getCurrentMemberstackUser,
  syncUserToSupabase,
  hasActiveTeacherSubscription,
  type MemberstackUser,
  type TeacherProfile,
} from "@/lib/memberstack"

interface AuthContextType {
  user: MemberstackUser | null
  teacherProfile: TeacherProfile | null
  isLoading: boolean
  isAuthenticated: boolean
  hasTeacherAccess: boolean
  login: () => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MemberstackUser | null>(null)
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user
  const hasTeacherAccess = user ? hasActiveTeacherSubscription(user) : false

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true)
      const memberstackUser = await getCurrentMemberstackUser()

      if (memberstackUser) {
        setUser(memberstackUser)
        // Sync user to Supabase and get teacher profile
        const profile = await syncUserToSupabase(memberstackUser)
        setTeacherProfile(profile)
      }
    } catch (error) {
      console.error("Error checking auth status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async () => {
    try {
      setIsLoading(true)
      // In a real implementation, this would trigger Memberstack login
      // For demo, we'll simulate successful login
      await checkAuthStatus()
    } catch (error) {
      console.error("Login error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setTeacherProfile(null)
    // In a real implementation, this would call Memberstack logout
    console.log("User logged out")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        teacherProfile,
        isLoading,
        isAuthenticated,
        hasTeacherAccess,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
