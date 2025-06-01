"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { User, Settings, LogOut, Mail, Calendar, GraduationCap } from "lucide-react"

export function UserMenu() {
  const { teacherProfile, logout } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const initials = teacherProfile
    ? teacherProfile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : ""

  const handleLogout = () => {
    logout()
    setShowDropdown(false)
    window.location.reload()
  }

  const handleProfileClick = () => {
    setShowProfileDialog(true)
    setShowDropdown(false)
  }

  const handleSettingsClick = () => {
    setShowSettingsDialog(true)
    setShowDropdown(false)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showDropdown])

  if (!teacherProfile) return null

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <Button
          variant="ghost"
          className="relative h-8 w-8 rounded-full p-0"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-56 bg-popover border border-border rounded-md shadow-lg z-50">
            <div className="p-3 border-b border-border">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{teacherProfile.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{teacherProfile.email}</p>
                <p className="text-xs leading-none text-muted-foreground capitalize">{teacherProfile.role}</p>
              </div>
            </div>

            <div className="py-1">
              <button
                onClick={handleProfileClick}
                className="flex items-center w-full px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
              >
                <User className="mr-2 h-4 w-4" />
                <span>View Profile</span>
              </button>

              <button
                onClick={handleSettingsClick}
                className="flex items-center w-full px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </button>

              <div className="border-t border-border my-1"></div>

              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-accent hover:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Teacher Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary text-primary-foreground text-lg font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">{teacherProfile.name}</h3>
                <p className="text-sm text-muted-foreground capitalize">{teacherProfile.role}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{teacherProfile.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Member Since</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(teacherProfile.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Account Type</p>
                  <p className="text-sm text-muted-foreground">Teacher Account</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">Account ID: {teacherProfile.id}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-3">Account Settings</h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" disabled>
                    <User className="mr-2 h-4 w-4" />
                    Edit Profile
                    <span className="ml-auto text-xs text-muted-foreground">Coming Soon</span>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" disabled>
                    <Mail className="mr-2 h-4 w-4" />
                    Change Email
                    <span className="ml-auto text-xs text-muted-foreground">Coming Soon</span>
                  </Button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-3">Preferences</h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" disabled>
                    <Settings className="mr-2 h-4 w-4" />
                    Notification Settings
                    <span className="ml-auto text-xs text-muted-foreground">Coming Soon</span>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" disabled>
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Teaching Preferences
                    <span className="ml-auto text-xs text-muted-foreground">Coming Soon</span>
                  </Button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-3">Data & Privacy</h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" disabled>
                    Export Data
                    <span className="ml-auto text-xs text-muted-foreground">Coming Soon</span>
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-red-600" disabled>
                    Delete Account
                    <span className="ml-auto text-xs text-muted-foreground">Coming Soon</span>
                  </Button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                For account changes, please contact support or visit your Memberstack dashboard.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
