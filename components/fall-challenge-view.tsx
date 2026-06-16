"use client"

import { useState } from "react"
import { ChapterToggle } from "./chapter-toggle"
import type { ReadingPlan } from "@/data/reading-plans"

interface Props {
  plan: ReadingPlan
  readChapters: Record<string, boolean[]>
  onToggleChapter: (book: string, chapterIndex: number) => void
}

const MONTHS = [
  { num: 9,  name: "September", short: "Sept", days: 30 },
  { num: 10, name: "October",   short: "Oct",  days: 31 },
  { num: 11, name: "November",  short: "Nov",  days: 30 },
  { num: 12, name: "December",  short: "Dec",  days: 31 },
]

function currentMonth(): number {
  const m = new Date().getMonth() + 1
  return m >= 9 && m <= 12 ? m : 9
}

export function FallChallengeView({ plan, readChapters, onToggleChapter }: Props) {
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [selectedDay, setSelectedDay] = useState<ReadingPlan["days"][number] | null>(null)

  const isDayCompleted = (day: ReadingPlan["days"][number]) =>
    day.chapters.every(({ book, chapter }) => readChapters[book]?.[chapter - 1])

  // index plan days by "M/D" key for O(1) lookup
  const planByDate = new Map(plan.days.map((d) => [d.date, d]))

  const month = MONTHS.find((m) => m.num === selectedMonth)!
  const today = new Date()
  const todayKey =
    today.getMonth() + 1 === selectedMonth
      ? `${selectedMonth}/${today.getDate()}`
      : null

  return (
    <>
      <div className="rounded-xl bg-card p-5 shadow-sm">
        {/* Month tabs */}
        <div className="mb-4 flex gap-1 rounded-lg bg-secondary p-1">
          {MONTHS.map((m) => (
            <button
              key={m.num}
              onClick={() => {
                setSelectedMonth(m.num)
                setSelectedDay(null)
              }}
              className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
                selectedMonth === m.num
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m.short}
            </button>
          ))}
        </div>

        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">{month.name}</h2>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: month.days }, (_, i) => i + 1).map((day) => {
            const key = `${month.num}/${day}`
            const dayData = planByDate.get(key)
            const completed = dayData ? isDayCompleted(dayData) : false
            const isToday = key === todayKey

            return (
              <button
                key={day}
                onClick={() => dayData && setSelectedDay(dayData)}
                disabled={!dayData}
                className={`aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-colors
                  ${isToday ? "ring-2 ring-primary ring-offset-1" : ""}
                  ${
                    completed
                      ? "bg-success text-success-foreground hover:bg-success/90"
                      : dayData
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-secondary text-muted-foreground cursor-default"
                  }`}
              >
                {day}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-primary" /> Reading
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-success" /> Done
          </span>
        </div>
      </div>

      {selectedDay && (
        <div className="rounded-xl bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-foreground">Daily Reading</h3>
          <div
            className={`flex items-center justify-between rounded-lg p-3 ${
              isDayCompleted(selectedDay) ? "bg-success/10" : "bg-secondary"
            }`}
          >
            <div>
              <div className="font-medium">{selectedDay.date}</div>
              <div className="text-sm text-muted-foreground">
                {selectedDay.chapters.map((c) => `${c.book} ${c.chapter}`).join(", ")}
              </div>
            </div>
            <div className={`text-sm ${isDayCompleted(selectedDay) ? "text-success" : "text-muted-foreground"}`}>
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
