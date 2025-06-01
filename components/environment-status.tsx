"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react"

interface EnvironmentStatus {
  supabase: boolean
  openai: boolean
  memberstack: boolean
  preview?: boolean
  message?: string
}

export function EnvironmentStatus() {
  const [status, setStatus] = useState<EnvironmentStatus>({
    supabase: false,
    openai: false,
    memberstack: false,
  })

  useEffect(() => {
    // Check environment status
    const checkStatus = async () => {
      try {
        const response = await fetch("/api/status")
        if (response.ok) {
          const data = await response.json()
          setStatus(data)
        }
      } catch (error) {
        console.error("Error checking environment status:", error)
      }
    }

    checkStatus()
  }, [])

  if (status.preview) {
    return (
      <div className="p-4 border-b bg-blue-50">
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium text-blue-700">Preview Environment</p>
              <p className="text-sm text-blue-600">
                Running in preview mode with mock data. Network connections to external services are disabled for
                stability.
              </p>
              {status.openai && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>OpenAI API configured - real AI responses enabled</span>
                </div>
              )}
              {!status.openai && (
                <p className="text-xs text-blue-600">
                  Add OPENAI_API_KEY to your environment variables for real AI-generated content.
                </p>
              )}
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const hasIssues = !status.supabase || !status.openai

  if (!hasIssues) return null

  return (
    <div className="p-4 border-b bg-muted/30">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">Environment Configuration Status:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
              <div className="flex items-center gap-2">
                {status.supabase ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span>Supabase {status.supabase ? "Connected" : "Not configured"}</span>
              </div>
              <div className="flex items-center gap-2">
                {status.openai ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span>OpenAI {status.openai ? "Connected" : "Not configured"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-500" />
                <span>Mock Auth Active</span>
              </div>
            </div>
            {!status.supabase && (
              <p className="text-xs text-muted-foreground">
                Using mock data. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_ANON_KEY for persistent storage.
              </p>
            )}
            {!status.openai && (
              <p className="text-xs text-muted-foreground">
                Using mock responses. Add OPENAI_API_KEY for AI-generated content.
              </p>
            )}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}
