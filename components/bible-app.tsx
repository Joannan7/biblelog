"use client"

import { useState, useEffect } from "react"
import { BookOpen, ChevronDown, ChevronUp, LogOut } from "lucide-react"
import { useUser, SignOutButton } from "@clerk/nextjs"
import { bibleBooks, totalChapters } from "@/lib/bible-data"
import { readingPlans } from "@/lib/reading-plans"
import { ProgressCircle } from "./progress-circle"
import { BottomNav } from "./bottom-nav"
import { BookList } from "./book-list"
import { PlanPage } from "./plan-page"
import { ProfilePage } from "./profile-page"
import { ChapterToggle } from "./chapter-toggle"

type Tab = "home" | "plan" | "profile"
type Filter = "all" | "old" | "new"

const STORAGE_KEY = "bible-reading-progress"

export function BibleApp() {
  const { user, isLoaded: isUserLoaded } = useUser()
  const [activeTab, setActiveTab] = useState<Tab>("home")
  const [filter, setFilter] = useState<Filter>("all")
  const [readChapters, setReadChapters] = useState<Record<string, boolean[]>>({})
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
  const [expandedDate, setExpandedDate] = useState<string | null>(null)
  const [selectedDay, setSelectedDay] = useState<any>(null)

  // Fetch user's plan and progress from API if signed in
  useEffect(() => {
    if (!isUserLoaded) return

    if (user) {
      // Fetch the selected plan
      fetch("/api/plan")
        .then((res) => res.json())
        .then((data) => {
          if (data.planId && data.planId !== "free-reading") {
            setCurrentPlan(data.planId)
          } else {
            setCurrentPlan(null)
          }
        })
        .catch(() => {
          setCurrentPlan(null)
        })
    } else {
      // Not signed in, use localStorage
      setCurrentPlan(null)
      setIsLoaded(true)
    }
  }, [user, isUserLoaded])

  // Fetch progress for current plan whenever plan changes
  useEffect(() => {
    if (!isUserLoaded || !user) {
      loadFromLocalStorage(currentPlan)
      setIsLoaded(true)
      return
    }

    // Fetch reading progress for this specific plan
    const planParam = currentPlan || "free-reading"
    fetch(`/api/progress?planId=${planParam}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const chapters: Record<string, boolean[]> = {}
          data.forEach((progress: any) => {
            if (!chapters[progress.book]) {
              const book = bibleBooks.find((b) => b.name === progress.book)
              chapters[progress.book] = Array(book?.chapters || 0).fill(false)
            }
            chapters[progress.book][progress.chapter - 1] = progress.completed
          })
          setReadChapters(chapters)
        } else {
          setReadChapters({})
        }
        setIsLoaded(true)
      })
      .catch(() => {
        setReadChapters({})
        setIsLoaded(true)
      })
  }, [currentPlan, user, isUserLoaded])

  const loadFromLocalStorage = (planId: string | null) => {
    const key = planId ? `bible-reading-progress-${planId}` : STORAGE_KEY
    const saved = localStorage.getItem(key)
    if (saved) {
      try {
        setReadChapters(JSON.parse(saved))
      } catch {
        // Invalid data, start fresh
      }
    } else {
      setReadChapters({})
    }
  }

  // Save progress whenever it changes
  useEffect(() => {
    if (!isLoaded) return

    if (!user) {
      const key = currentPlan ? `bible-reading-progress-${currentPlan}` : STORAGE_KEY
      localStorage.setItem(key, JSON.stringify(readChapters))
      return
    }

    // Batch save: collect all changes for this plan
    const planId = currentPlan || "free-reading"
    const changes: Array<{
      planId: string
      book: string
      chapter: number
      completed: boolean
    }> = []

    Object.entries(readChapters).forEach(([bookName, chapters]) => {
      chapters.forEach((isRead, chapterIndex) => {
        changes.push({
          planId,
          book: bookName,
          chapter: chapterIndex + 1,
          completed: isRead,
        })
      })
    })

    // Send all changes in one request
    if (changes.length > 0) {
      fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ changes }),
      }).catch((err) => console.error("Failed to save progress:", err))
    }
  }, [readChapters, isLoaded, currentPlan, user])

  // Save selected plan when it changes
  useEffect(() => {
    if (!isLoaded || !user) return

    fetch("/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId: currentPlan || "free-reading" }),
    }).catch((err) => console.error("Failed to save plan:", err))
  }, [currentPlan, isLoaded, user])

  const isDayCompleted = (day: any) => {
    return day.chapters.every(({ book, chapter }: any) => {
      const bookChapters = readChapters[book]
      return bookChapters && bookChapters[chapter - 1]
    })
  }

  const toggleChapter = (bookName: string, chapterIndex: number) => {
    setReadChapters((prev) => {
      const book = bibleBooks.find((b) => b.name === bookName)
      if (!book) return prev

      const chapters = prev[bookName] || Array(book.chapters).fill(false)
      const newChapters = [...chapters]
      newChapters[chapterIndex] = !newChapters[chapterIndex]

      return { ...prev, [bookName]: newChapters }
    })
  }

  const chaptersRead = Object.values(readChapters).reduce(
    (sum, chapters) => sum + chapters.filter(Boolean).length,
    0
  )

  const getPlanProgress = (planId: string) => {
    const plan = readingPlans.find((p) => p.id === planId)
    if (!plan) return { read: 0, total: 0 }

    const total = plan.days.reduce((sum, day) => sum + day.chapters.length, 0)
    const read = plan.days.reduce((sum, day) => {
      const dayRead = day.chapters.reduce((chapterSum, { book, chapter }) => {
        return chapterSum + (readChapters[book]?.[chapter - 1] ? 1 : 0)
      }, 0)

      return sum + dayRead
    }, 0)

    return { read, total }
  }

  const planProgress = currentPlan ? getPlanProgress(currentPlan) : { read: 0, total: 0 }
  const displayRead = currentPlan ? planProgress.read : chaptersRead
  const displayTotal = currentPlan ? planProgress.total : totalChapters
  const progress = displayTotal > 0 ? (displayRead / displayTotal) * 100 : 0

  const filteredBooks = bibleBooks.filter((book) => {
    if (filter === "all") return true
    return book.testament === filter
  })

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "All Books" },
    { id: "old", label: "Old Testament" },
    { id: "new", label: "New Testament" },
  ]

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
              <p className="text-xs text-muted-foreground">Track your journey through Scripture</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
                {displayRead} of {displayTotal} chapters read
              </p>
            </div>

            {currentPlan === 'summer-challenge' ? (() => {
              const plan = readingPlans.find(p => p.id === currentPlan)
              if (!plan) return null

              return (
                <>
                  <div className="rounded-xl bg-card p-5 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold text-foreground">June Calendar</h2>
                    <div className="grid grid-cols-7 gap-2">
                      {Array.from({ length: 30 }, (_, i) => i + 1).map(day => {
                        const dayData = plan.days.find(d => d.date === `June ${day}`)
                        return (
                          <button
                            key={day}
                            onClick={() => dayData && setSelectedDay(dayData)}
                            className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium ${
                              dayData
                                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                : 'bg-secondary text-muted-foreground'
                            }`}
                            disabled={!dayData}
                          >
                            {day}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {selectedDay && (
                    <div className="rounded-xl bg-card p-5 shadow-sm">
                      <h3 className="mb-4 text-lg font-semibold text-foreground">Daily Progress</h3>
                      <div className={`flex items-center justify-between rounded-lg p-3 ${
                        isDayCompleted(selectedDay) ? 'bg-green-100 dark:bg-green-900' : 'bg-secondary'
                      }`}>
                        <div>
                          <div className="font-medium">{selectedDay.date}</div>
                          <div className="text-sm text-muted-foreground">
                            {selectedDay.chapters.map((c: any) => `${c.book} ${c.chapter}`).join(', ')}
                          </div>
                        </div>
                        <div className={`text-sm ${isDayCompleted(selectedDay) ? 'text-green-600' : 'text-muted-foreground'}`}>
                          {isDayCompleted(selectedDay) ? 'Completed' : 'Pending'}
                        </div>
                      </div>
                      <div className="mt-4 border-t border-border pt-4">
                        <div className="grid grid-cols-5 gap-2">
                          {selectedDay.chapters.map(({ book, chapter }: any) => {
                            const isRead = readChapters[book]?.[chapter - 1] || false
                            return (
                              <ChapterToggle
                                key={`${book}-${chapter}`}
                                chapter={chapter}
                                isRead={isRead}
                                onToggle={() => toggleChapter(book, chapter - 1)}
                              />
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )
            })() : currentPlan ? (
              <div className="flex flex-col gap-3">
                {readingPlans.find(p => p.id === currentPlan)?.days.slice(0, 10).map((day, dayIndex) => {
                  const dateKey = day.date || `Day ${day.day}`
                  const isExpanded = expandedDate === dateKey
                  const totalChaptersInDay = day.chapters.length
                  const readCount = day.chapters.filter(({ book, chapter }) => readChapters[book]?.[chapter - 1]).length

                  return (
                    <div key={dayIndex} className="overflow-hidden rounded-xl bg-card shadow-sm">
                      <button
                        onClick={() => setExpandedDate(isExpanded ? null : dateKey)}
                        className="flex w-full items-center gap-3 p-4"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 text-left">
                          <h3 className="font-semibold text-foreground">{dateKey}</h3>
                          <p className="text-sm text-muted-foreground">
                            {readCount} of {totalChaptersInDay} chapters
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="border-t border-border p-4">
                          <div className="grid grid-cols-5 gap-2">
                            {day.chapters.map(({ book, chapter }) => {
                              const isRead = readChapters[book]?.[chapter - 1] || false
                              return (
                                <ChapterToggle
                                  key={`${book}-${chapter}`}
                                  chapter={chapter}
                                  isRead={isRead}
                                  onToggle={() => toggleChapter(book, chapter - 1)}
                                />
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  {filters.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFilter(f.id)}
                      className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        filter === f.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-card text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <BookList
                  books={filteredBooks}
                  readChapters={readChapters}
                  onToggleChapter={toggleChapter}
                />
              </>
            )}
          </div>
        )}

        {activeTab === "plan" && (
          <PlanPage
            chaptersRead={chaptersRead}
            currentPlan={currentPlan}
            onPlanChange={setCurrentPlan}
            readChapters={readChapters}
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
