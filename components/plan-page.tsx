"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, BookOpen, Target } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { totalChapters } from "@/lib/bible-data"
import { readingPlans, ReadingPlan } from "@/lib/reading-plans"
import { ProgressCircle } from "./progress-circle"

interface PlanPageProps {
  chaptersRead: number
  currentPlan: string | null
  onPlanChange: (planId: string | null) => void
  readChapters: Record<string, boolean[]>
}

export function PlanPage({ chaptersRead, currentPlan, onPlanChange, readChapters }: PlanPageProps) {
  const { user } = useUser()
  const [planProgresses, setPlanProgresses] = useState<Record<string, { read: number; total: number }>>({})

  const getTotalChaptersForPlan = (plan: ReadingPlan) => {
    return plan.days.reduce((sum, day) => sum + day.chapters.length, 0)
  }

  const getProgressForPlan = (planId: string) => {
    const key = `bible-reading-progress-${planId}`
    const saved = localStorage.getItem(key)
    if (!saved) return { read: 0, total: 0 }
    try {
      const planReadChapters = JSON.parse(saved) as Record<string, boolean[]>
      const plan = readingPlans.find(p => p.id === planId)
      if (!plan) return { read: 0, total: 0 }
      const total = getTotalChaptersForPlan(plan)
      const read = Object.values(planReadChapters).reduce(
        (sum, chapters) => sum + chapters.filter(Boolean).length,
        0
      )
      return { read, total }
    } catch {
      return { read: 0, total: 0 }
    }
  }

  useEffect(() => {
    if (!user) {
      const progresses: Record<string, { read: number; total: number }> = {}
      readingPlans.forEach(plan => {
        progresses[plan.id] = getProgressForPlan(plan.id)
      })
      setPlanProgresses(progresses)
      return
    }

    const fetchPlanProgresses = async () => {
      try {
        const ids = ["free-reading", ...readingPlans.map((p) => p.id)]
        const results = await Promise.all(
          ids.map(async (id) => {
            const res = await fetch(`/api/progress?planId=${id}`)
            const data = await res.json()
            const read = Array.isArray(data)
              ? data.filter((item: { completed: boolean }) => item.completed).length
              : 0
            const total =
              id === "free-reading"
                ? totalChapters
                : getTotalChaptersForPlan(readingPlans.find((p) => p.id === id) as ReadingPlan)
            return [id, { read, total }] as const
          })
        )

        setPlanProgresses(Object.fromEntries(results))
      } catch {
        setPlanProgresses({})
      }
    }

    fetchPlanProgresses()
  }, [currentPlan, user])

  const remaining = totalChapters - chaptersRead
  const chaptersPerDay = 3
  const daysToComplete = Math.ceil(remaining / chaptersPerDay)

  return (
    <div className="flex flex-col gap-6 pb-24 pt-6">
      <div className="rounded-xl bg-card p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Reading Plans</h2>
        <div className="space-y-4">
          <button
            onClick={() => onPlanChange(null)}
            className={`w-full rounded-lg p-4 text-left transition-colors ${
              currentPlan === null
                ? "bg-primary text-primary-foreground"
                : "bg-secondary hover:bg-secondary/80"
            }`}
          >
            <div className="font-medium">Free Reading</div>
            <div className="text-sm opacity-80">Read at your own pace</div>
            <div className="mt-2 text-sm">
              {(planProgresses["free-reading"]?.read ?? (currentPlan === null ? chaptersRead : 0))} of {totalChapters} chapters read
            </div>
          </button>
          {readingPlans.map((plan) => {
            const progress = planProgresses[plan.id] || { read: 0, total: 0 }
            const progressPercent = progress.total > 0 ? (progress.read / progress.total) * 100 : 0
            return (
              <button
                key={plan.id}
                onClick={() => onPlanChange(plan.id)}
                className={`w-full rounded-lg p-4 text-left transition-colors ${
                  currentPlan === plan.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary hover:bg-secondary/80"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{plan.name}</div>
                    <div className="text-sm opacity-80">{plan.description}</div>
                    <div className="mt-2 text-sm">
                      {progress.read} of {progress.total} chapters read
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <ProgressCircle progress={progressPercent} size={60} />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="rounded-xl bg-card p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Your Progress</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-primary/10 p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Chapters Read</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">{chaptersRead}</p>
          </div>
          <div className="rounded-lg bg-secondary p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Remaining</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">{remaining}</p>
          </div>
        </div>
        <div className="mt-4 rounded-lg bg-secondary p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">At {chaptersPerDay} chapters/day</span>
          </div>
          <p className="mt-2 text-lg font-semibold text-foreground">{daysToComplete} days to complete</p>
        </div>
      </div>
    </div>
  )
}
