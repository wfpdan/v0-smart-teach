"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { MarkdownRenderer } from "@/components/markdown-renderer"

interface Message {
  id: string
  thread_id: string
  sender: "teacher" | "ai"
  content: string
  timestamp: string
  isStreaming?: boolean
}

interface ChatInterfaceProps {
  messages: Message[]
  onSendMessage: (content: string) => void
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
  selectedThread: any
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
}

export function ChatInterface({
  messages,
  onSendMessage,
  isLoading,
  setIsLoading,
  selectedThread,
  setMessages,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [streamAbortController, setStreamAbortController] = useState<AbortController | null>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Cleanup function for aborting any ongoing streams when component unmounts
  useEffect(() => {
    return () => {
      if (streamAbortController) {
        streamAbortController.abort()
      }
    }
  }, [streamAbortController])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      handleSendMessage(input.trim())
      setInput("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleSendMessage = async (content: string) => {
    if (!selectedThread) {
      console.error("No thread selected")
      return
    }

    // Abort any ongoing streams
    if (streamAbortController) {
      streamAbortController.abort()
    }

    setIsLoading(true)

    // Create a new abort controller for this stream
    const abortController = new AbortController()
    setStreamAbortController(abortController)

    // Add teacher message
    const teacherMessage: Message = {
      id: Date.now().toString(),
      thread_id: selectedThread.id,
      sender: "teacher",
      content,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, teacherMessage])

    // Create a placeholder AI message for streaming
    const aiMessageId = (Date.now() + 1).toString()
    const aiMessage: Message = {
      id: aiMessageId,
      thread_id: selectedThread.id,
      sender: "ai",
      content: "",
      timestamp: new Date().toISOString(),
      isStreaming: true,
    }

    setMessages((prev) => [...prev, aiMessage])

    try {
      // Call AI API with all required fields
      const requestBody = {
        thread_id: selectedThread.id,
        message: content,
        teacher_id: selectedThread.teacher_id || "teacher_123", // Fallback ID for preview
        student_context: {
          name: selectedThread.student_name,
          grade: selectedThread.grade,
          tags: selectedThread.tags || [],
        },
      }

      console.log("Sending streaming request to API:", requestBody)

      const response = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: abortController.signal,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API Error:", response.status, errorText)
        throw new Error(`API Error: ${response.status}`)
      }

      if (!response.body) {
        throw new Error("Response body is null")
      }

      // Process the stream
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulatedContent = ""

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          // Decode the chunk and process it
          const chunk = decoder.decode(value, { stream: true })

          // Process each line in the chunk
          const lines = chunk.split("\n")

          for (const line of lines) {
            if (line.trim() === "") continue

            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim()

              if (data === "[DONE]") {
                // Streaming complete
                setMessages((prev) =>
                  prev.map((msg) => (msg.id === aiMessageId ? { ...msg, isStreaming: false } : msg)),
                )
                continue
              }

              try {
                const parsed = JSON.parse(data)

                if (parsed.content) {
                  accumulatedContent += parsed.content
                  setMessages((prev) =>
                    prev.map((msg) => (msg.id === aiMessageId ? { ...msg, content: accumulatedContent } : msg)),
                  )
                }

                if (parsed.error) {
                  throw new Error(parsed.error)
                }
              } catch (e) {
                console.warn("Error parsing SSE data:", e)
                // Continue processing other lines
              }
            }
          }
        }
      } catch (streamError) {
        if (streamError.name === "AbortError") {
          console.log("Stream aborted")
        } else {
          throw streamError
        }
      } finally {
        reader.releaseLock()
      }

      // Mark streaming as complete
      setMessages((prev) => prev.map((msg) => (msg.id === aiMessageId ? { ...msg, isStreaming: false } : msg)))
    } catch (error) {
      console.error("Error sending message:", error)

      // Only handle error if not aborted
      if (error.name !== "AbortError") {
        // Update the streaming message with error or remove it
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? {
                  ...msg,
                  content: `Sorry, I encountered an error: ${
                    error instanceof Error ? error.message : "Unknown error"
                  }. Please try again.`,
                  isStreaming: false,
                }
              : msg,
          ),
        )
      }
    } finally {
      setIsLoading(false)
      setStreamAbortController(null)
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Messages Area - Scrollable */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            <div className="max-w-4xl mx-auto space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn("flex", message.sender === "teacher" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] sm:max-w-[80%] rounded-lg px-3 py-2 sm:px-4 sm:py-3",
                      message.sender === "teacher" ? "bg-primary text-primary-foreground" : "bg-muted border",
                    )}
                  >
                    {/* Render content based on sender */}
                    {message.sender === "teacher" ? (
                      <div className="whitespace-pre-wrap text-sm leading-relaxed break-words">{message.content}</div>
                    ) : (
                      <MarkdownRenderer
                        content={message.content}
                        isStreaming={message.isStreaming}
                        className="text-foreground"
                      />
                    )}

                    <div
                      className={cn(
                        "text-xs mt-2 opacity-70",
                        message.sender === "teacher" ? "text-right" : "text-left",
                      )}
                    >
                      {formatTimestamp(message.timestamp)}
                      {message.isStreaming && <span className="ml-2">Typing...</span>}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && messages.filter((m) => m.isStreaming).length === 0 && (
                <div className="flex justify-start">
                  <div className="bg-muted border rounded-lg px-3 py-2 sm:px-4 sm:py-3 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                </div>
              )}

              {/* Invisible element to scroll to */}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="border-t bg-background p-3 sm:p-4 flex-shrink-0">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask for a lesson plan, activity, or teaching advice..."
              className="min-h-[50px] max-h-[120px] resize-none text-sm sm:text-base"
              disabled={isLoading}
              rows={2}
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-[50px] w-[50px] sm:h-[60px] sm:w-[60px] flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
