"use client"

import { useState, useEffect } from "react"
import { BookOpen, LogOut, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { useUser, SignOutButton } from "@clerk/nextjs"
import { readingPlans } from "@/data/reading-plans"
import { useReadingProgress } from "@/hooks/use-reading-progress"
import { ProgressCircle } from "./progress-circle"
import { BottomNav } from "./bottom-nav"
import { PlanPage } from "./plan-page"
import { ProfilePage } from "./profile-page"
import { FallChallengeView } from "./fall-challenge-view"

type Tab = "home" | "plan" | "profile"

const plan = readingPlans.find((p) => p.id === "fall-challenge")!

export function BibleApp() {
  const { user } = useUser()
  const { readChapters, isLoaded, toggleChapter } = useReadingProgress()
  const [activeTab, setActiveTab] = useState<Tab>("home")
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const totalChapters = plan.days.reduce((sum, day) => sum + day.chapters.length, 0)
  const chaptersRead = plan.days.reduce((sum, day) => {
    return sum + day.chapters.filter(({ book, chapter }) => readChapters[book]?.[chapter - 1]).length
  }, 0)
  const progress = totalChapters > 0 ? (chaptersRead / totalChapters) * 100 : 0

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Bible Reading Log</h1>
              <p className="text-xs text-muted-foreground">Fall Reading Challenge</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {mounted && (
              <button
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="rounded-lg p-2 hover:bg-secondary"
                aria-label="Toggle theme"
              >
                {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            )}
            {user ? (
              <>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                  {user.imageUrl && (
                    <img src={user.imageUrl} alt={user.fullName || "User"} className="h-full w-full rounded-full" />
                  )}
                </div>
                <SignOutButton>
                  <button className="rounded-lg p-2 hover:bg-secondary">
                    <LogOut className="h-4 w-4" />
                  </button>
                </SignOutButton>
              </>
            ) : (
              <a href="/sign-in" className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                Sign In
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 pb-24">
        {activeTab === "home" && (
          <div className="flex flex-col gap-6 pb-6 pt-6">
            <div className="flex flex-col items-center rounded-xl bg-card p-6 shadow-sm">
              <ProgressCircle progress={progress} />
              <p className="mt-4 text-sm text-muted-foreground">
                {chaptersRead} of {totalChapters} chapters read
              </p>
            </div>
            <FallChallengeView
              plan={plan}
              readChapters={readChapters}
              onToggleChapter={toggleChapter}
            />
          </div>
        )}

        {activeTab === "plan" && (
          <PlanPage
            readChapters={readChapters}
            onToggleChapter={toggleChapter}
          />
        )}

        {activeTab === "profile" && (
          <ProfilePage chaptersRead={chaptersRead} readChapters={readChapters} />
        )}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
