"use client"

import type React from "react"

import { useAuth } from "@/hooks/use-auth"
import { LoginPage } from "@/components/login-page"
import { LoadingSpinner } from "@/components/loading-spinner"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isLoading, isAuthenticated, hasTeacherAccess } = useAuth()

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  if (!hasTeacherAccess) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-2xl font-bold mb-4">Access Restricted</h1>
          <p className="text-muted-foreground mb-6">
            You need an active teacher subscription to access this application. Please upgrade your plan to continue.
          </p>
          <button
            onClick={() => {
              // In a real implementation, this would redirect to Memberstack billing
              window.open("https://your-memberstack-billing-url.com", "_blank")
            }}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90"
          >
            Upgrade Plan
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
