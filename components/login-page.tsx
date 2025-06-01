"use client"

import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { GraduationCap, BookOpen, Users, Sparkles } from "lucide-react"

export function LoginPage() {
  const { login, isLoading } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Theme Toggle */}
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Teacher AI Chat</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            AI-powered lesson planning and curriculum recommendations for educators
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Features */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <BookOpen className="w-6 h-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Personalized Lesson Plans</h3>
                <p className="text-sm text-muted-foreground">
                  Create custom lesson plans tailored to each student's learning style and interests
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Users className="w-6 h-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Student Thread Management</h3>
                <p className="text-sm text-muted-foreground">
                  Organize conversations by student with persistent chat history and context
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Sparkles className="w-6 h-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold mb-1">AI-Powered Recommendations</h3>
                <p className="text-sm text-muted-foreground">
                  Get intelligent curriculum suggestions based on educational best practices
                </p>
              </div>
            </div>
          </div>

          {/* Login Card */}
          <Card>
            <CardHeader>
              <CardTitle>Welcome Back</CardTitle>
              <CardDescription>Sign in to access your teacher dashboard and student threads</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={login} disabled={isLoading} className="w-full" size="lg">
                {isLoading ? "Signing in..." : "Sign In with Memberstack"}
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <button
                    onClick={() => {
                      // In a real implementation, this would redirect to Memberstack signup
                      window.open("https://your-memberstack-signup-url.com", "_blank")
                    }}
                    className="text-primary hover:underline"
                  >
                    Sign up here
                  </button>
                </p>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground text-center">
                  For demo purposes, clicking "Sign In" will automatically log you in as a sample teacher account.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
