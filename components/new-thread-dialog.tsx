"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface NewThreadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateThread: (data: { student_name: string; grade: string; tags: string[] }) => void
}

const COMMON_TAGS = [
  "Math",
  "Science",
  "Reading",
  "Writing",
  "History",
  "Art",
  "Music",
  "Visual Learner",
  "Auditory Learner",
  "Kinesthetic Learner",
  "Struggling",
  "Advanced",
  "Curious",
  "Shy",
  "Outgoing",
  "Hands-on",
  "Creative",
  "Analytical",
  "Social",
  "Independent",
]

export function NewThreadDialog({ open, onOpenChange, onCreateThread }: NewThreadDialogProps) {
  const [studentName, setStudentName] = useState("")
  const [grade, setGrade] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (studentName.trim() && grade.trim()) {
      onCreateThread({
        student_name: studentName.trim(),
        grade: grade.trim(),
        tags: selectedTags,
      })
      // Reset form
      setStudentName("")
      setGrade("")
      setSelectedTags([])
      setCustomTag("")
    }
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const addCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags((prev) => [...prev, customTag.trim()])
      setCustomTag("")
    }
  }

  const removeTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Student Thread</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="student-name">Student Name</Label>
            <Input
              id="student-name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Enter student's name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade">Grade Level</Label>
            <Input
              id="grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="e.g., 5th Grade, Kindergarten"
              required
            />
          </div>

          <div className="space-y-3">
            <Label>Student Interests & Learning Style (Optional)</Label>

            {/* Selected Tags */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
            )}

            {/* Common Tags */}
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Common tags:</div>
              <div className="flex flex-wrap gap-2">
                {COMMON_TAGS.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Custom Tag Input */}
            <div className="flex gap-2">
              <Input
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                placeholder="Add custom tag"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomTag())}
              />
              <Button type="button" onClick={addCustomTag} variant="outline">
                Add
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Thread</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
