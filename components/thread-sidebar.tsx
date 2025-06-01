"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface Thread {
  id: string
  student_name: string
  grade: string
  tags: string[]
  created_at: string
  last_message?: string
}

interface ThreadSidebarProps {
  threads: Thread[]
  selectedThread: Thread | null
  onSelectThread: (thread: Thread) => void
}

export function ThreadSidebar({ threads, selectedThread, onSelectThread }: ThreadSidebarProps) {
  return (
    <div className="flex-1 overflow-hidden">
      <ScrollArea className="h-full">
        <div className="p-2 space-y-2">
          {threads.map((thread) => (
            <div
              key={thread.id}
              onClick={() => onSelectThread(thread)}
              className={cn(
                "p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent",
                selectedThread?.id === thread.id && "bg-accent",
              )}
            >
              <div className="font-medium text-sm mb-1 truncate">{thread.student_name}</div>
              <div className="text-xs text-muted-foreground mb-2">{thread.grade}</div>
              {thread.last_message && (
                <div className="text-xs text-muted-foreground italic line-clamp-2 mb-2">{thread.last_message}</div>
              )}
              <div className="flex flex-wrap gap-1">
                {thread.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded truncate">
                    {tag}
                  </span>
                ))}
                {thread.tags.length > 2 && (
                  <span className="text-xs text-muted-foreground">+{thread.tags.length - 2}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
