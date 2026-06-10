"use client"

import { useState } from "react"
import { ChapterToggle } from "./chapter-toggle"
import type { ReadingPlan } from "@/data/reading-plans"

interface Props {
  plan: ReadingPlan
  readChapters: Record<string, boolean[]>
  onToggleChapter: (book: string, chapterIndex: number) => void
}

export function FallChallengeView({ plan, readChapters, onToggleChapter }: Props) {
  const [selectedDay, setSelectedDay] = useState<ReadingPlan["days"][number] | null>(null)

  const isDayCompleted = (day: ReadingPlan["days"][number]) =>
    day.chapters.every(({ book, chapter }) => readChapters[book]?.[chapter - 1])

  return (
    <>
      <div className="rounded-xl bg-card p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-foreground">September Calendar</h2>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
            const dayData = plan.days.find((d) => d.date === `Sept ${day}`)
            return (
              <button
                key={day}
                onClick={() => dayData && setSelectedDay(dayData)}
                className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium ${
                  dayData
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-secondary text-muted-foreground"
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
          <div
            className={`flex items-center justify-between rounded-lg p-3 ${
              isDayCompleted(selectedDay) ? "bg-green-100 dark:bg-green-900" : "bg-secondary"
            }`}
          >
            <div>
              <div className="font-medium">{selectedDay.date}</div>
              <div className="text-sm text-muted-foreground">
                {selectedDay.chapters.map((c) => `${c.book} ${c.chapter}`).join(", ")}
              </div>
            </div>
            <div className={`text-sm ${isDayCompleted(selectedDay) ? "text-green-600" : "text-muted-foreground"}`}>
              {isDayCompleted(selectedDay) ? "Completed" : "Pending"}
            </div>
          </div>
          <div className="mt-4 border-t border-border pt-4">
            <div className="grid grid-cols-5 gap-2">
              {selectedDay.chapters.map(({ book, chapter }) => (
                <ChapterToggle
                  key={`${book}-${chapter}`}
                  chapter={chapter}
                  isRead={readChapters[book]?.[chapter - 1] || false}
                  onToggle={() => onToggleChapter(book, chapter - 1)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
