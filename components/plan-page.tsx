"use client"

import { BookOpen, Target, CheckCircle } from "lucide-react"
import { readingPlans } from "@/data/reading-plans"
import { ChapterToggle } from "./chapter-toggle"

interface PlanPageProps {
  readChapters: Record<string, boolean[]>
  onToggleChapter: (book: string, chapterIndex: number) => void
}

const plan = readingPlans.find((p) => p.id === "fall-challenge")!

export function PlanPage({ readChapters, onToggleChapter }: PlanPageProps) {
  const totalChapters = plan.days.reduce((sum, day) => sum + day.chapters.length, 0)
  const chaptersRead = plan.days.reduce((sum, day) => {
    return sum + day.chapters.filter(({ book, chapter }) => readChapters[book]?.[chapter - 1]).length
  }, 0)
  const remaining = totalChapters - chaptersRead

  return (
    <div className="flex flex-col gap-6 pb-24 pt-6">
      <div className="rounded-xl bg-card p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">{plan.name}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-primary/10 p-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Read</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-foreground">{chaptersRead}</p>
          </div>
          <div className="rounded-lg bg-secondary p-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Remaining</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-foreground">{remaining}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-card p-5 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-foreground">Full Schedule</h3>
        <div className="flex flex-col gap-3">
          {plan.days.map((day, i) => {
            const dateLabel = day.date
            const dayRead = day.chapters.filter(({ book, chapter }) => readChapters[book]?.[chapter - 1]).length
            const dayCompleted = dayRead === day.chapters.length

            return (
              <div key={i} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{dateLabel}</span>
                  {dayCompleted && <CheckCircle className="h-4 w-4 text-green-500" />}
                  {!dayCompleted && (
                    <span className="text-xs text-muted-foreground">{dayRead}/{day.chapters.length}</span>
                  )}
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {day.chapters.map(({ book, chapter }) => (
                    <ChapterToggle
                      key={`${book}-${chapter}`}
                      chapter={chapter}
                      isRead={readChapters[book]?.[chapter - 1] || false}
                      onToggle={() => onToggleChapter(book, chapter - 1)}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
