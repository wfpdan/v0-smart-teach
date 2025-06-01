"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { AuthGuard } from "@/components/auth-guard"
import { ChatInterface } from "@/components/chat-interface"
import { ThreadSidebar } from "@/components/thread-sidebar"
import { NewThreadDialog } from "@/components/new-thread-dialog"
import { UserMenu } from "@/components/user-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { EnvironmentStatus } from "@/components/environment-status"
import { Button } from "@/components/ui/button"
import { Menu, Plus } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface Thread {
  id: string
  teacher_id: string
  student_name: string
  grade: string
  tags: string[]
  created_at: string
  last_message?: string
}

interface Message {
  id: string
  thread_id: string
  sender: "teacher" | "ai"
  content: string
  timestamp: string
  isStreaming?: boolean
}

function ChatPageContent() {
  const { teacherProfile } = useAuth()
  const [threads, setThreads] = useState<Thread[]>([])
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isNewThreadOpen, setIsNewThreadOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Load teacher's threads on mount
  useEffect(() => {
    if (teacherProfile) {
      loadTeacherThreads()
    }
  }, [teacherProfile])

  const loadTeacherThreads = async () => {
    try {
      const response = await fetch(`/api/threads?teacher_id=${teacherProfile?.id}`)
      if (response.ok) {
        const data = await response.json()
        setThreads(data.threads || [])
        if (data.threads?.length > 0) {
          setSelectedThread(data.threads[0])
        }
      }
    } catch (error) {
      console.error("Error loading threads:", error)
      // Use mock data for demo
      const mockThreads: Thread[] = [
        {
          id: "1",
          teacher_id: teacherProfile?.id || "",
          student_name: "Alex Johnson",
          grade: "5th Grade",
          tags: ["Science", "Curious", "Visual Learner"],
          created_at: new Date().toISOString(),
          last_message: "Can you create a fun science experiment about volcanoes?",
        },
        {
          id: "2",
          teacher_id: teacherProfile?.id || "",
          student_name: "Emma Davis",
          grade: "3rd Grade",
          tags: ["Math", "Struggling", "Hands-on"],
          created_at: new Date().toISOString(),
          last_message: "I need help with multiplication tables",
        },
      ]
      setThreads(mockThreads)
      setSelectedThread(mockThreads[0])
    }
  }

  useEffect(() => {
    if (selectedThread) {
      loadThreadMessages(selectedThread.id)
    }
  }, [selectedThread])

  const loadThreadMessages = async (threadId: string) => {
    try {
      const response = await fetch(`/api/messages?thread_id=${threadId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error("Error loading messages:", error)
      // Use mock data for demo
      const mockMessages: Message[] = [
        {
          id: "1",
          thread_id: threadId,
          sender: "teacher",
          content: "Can you create a fun science experiment about volcanoes for Alex?",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: "2",
          thread_id: threadId,
          sender: "ai",
          content: `Here's a perfect volcano experiment for Alex! 

**Baking Soda Volcano Experiment**

**Materials needed:**
- Baking soda (2 tablespoons)
- White vinegar (1/4 cup)
- Red food coloring
- Dish soap (few drops)
- Small plastic bottle
- Clay or playdough
- Funnel

**Instructions:**
1. Build a volcano shape around the bottle using clay
2. Mix baking soda with red food coloring in the bottle
3. Add a few drops of dish soap
4. Pour vinegar into the bottle and watch it erupt!

**Learning objectives:**
- Chemical reactions (acid + base)
- Volcanic formation
- Scientific observation skills

This hands-on experiment is perfect for Alex's visual learning style and curiosity about science!`,
          timestamp: new Date(Date.now() - 3000000).toISOString(),
        },
      ]
      setMessages(mockMessages)
    }
  }

  const handleNewThread = async (threadData: { student_name: string; grade: string; tags: string[] }) => {
    try {
      const response = await fetch("/api/threads/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...threadData,
          teacher_id: teacherProfile?.id,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const newThread = data.thread
        setThreads((prev) => [newThread, ...prev])
        setSelectedThread(newThread)
        setMessages([])
      }
    } catch (error) {
      console.error("Error creating thread:", error)
      // Fallback to local state for demo
      const newThread: Thread = {
        id: Date.now().toString(),
        teacher_id: teacherProfile?.id || "",
        ...threadData,
        created_at: new Date().toISOString(),
      }
      setThreads((prev) => [newThread, ...prev])
      setSelectedThread(newThread)
      setMessages([])
    }
    setIsNewThreadOpen(false)
  }

  const handleSendMessage = async (content: string) => {
    // This function is now handled entirely by the ChatInterface component
    // We keep it here for compatibility but it's not used
    console.log("Message sending handled by ChatInterface component")
  }

  const sidebarContent = (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <Button onClick={() => setIsNewThreadOpen(true)} className="w-full" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Thread
        </Button>
      </div>
      <ThreadSidebar threads={threads} selectedThread={selectedThread} onSelectThread={setSelectedThread} />
    </div>
  )

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
      {/* Environment Status Banner */}
      <EnvironmentStatus />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex w-80 border-r bg-muted/30 flex-shrink-0">{sidebarContent}</div>

        {/* Mobile Sidebar */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetContent side="left" className="w-80 p-0">
            {sidebarContent}
          </SheetContent>
        </Sheet>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <div className="border-b p-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden">
                    <Menu className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  {sidebarContent}
                </SheetContent>
              </Sheet>

              {selectedThread && (
                <div className="min-w-0 flex-1">
                  <h1 className="font-semibold truncate">Student: {selectedThread.student_name}</h1>
                  <p className="text-sm text-muted-foreground truncate">
                    {selectedThread.grade} • {selectedThread.tags.join(", ")}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <UserMenu />
            </div>
          </div>

          {/* Chat Interface */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {selectedThread ? (
              <ChatInterface
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                selectedThread={selectedThread}
                setMessages={setMessages}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground p-4">
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-2">Welcome, {teacherProfile?.name}!</h2>
                  <p className="text-sm">Select a student thread or create a new one to get started</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <NewThreadDialog open={isNewThreadOpen} onOpenChange={setIsNewThreadOpen} onCreateThread={handleNewThread} />
    </div>
  )
}

export default function ChatPage() {
  return (
    <AuthGuard>
      <ChatPageContent />
    </AuthGuard>
  )
}
