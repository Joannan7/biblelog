"use client"

import { User, BookOpen, Award, Settings, ChevronRight } from "lucide-react"
import { totalChapters, bibleBooks } from "@/lib/bible-data"

interface ProfilePageProps {
  chaptersRead: number
  readChapters: Record<string, boolean[]>
}

export function ProfilePage({ chaptersRead, readChapters }: ProfilePageProps) {
  const percentage = Math.round((chaptersRead / totalChapters) * 100)

  const booksCompleted = bibleBooks.filter((book) => {
    const chapters = readChapters[book.name] || []
    return chapters.filter(Boolean).length === book.chapters
  }).length

  const menuItems = [
    { label: "Reading History", icon: BookOpen },
    { label: "Achievements", icon: Award },
    { label: "Settings", icon: Settings },
  ]

  return (
    <div className="flex flex-col gap-6 pb-24 pt-6">
      <div className="flex flex-col items-center rounded-xl bg-card p-6 shadow-sm">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <User className="h-10 w-10 text-primary" />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Bible Reader</h2>
        <p className="text-sm text-muted-foreground">Keep up the great work!</p>

        <div className="mt-6 grid w-full grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{chaptersRead}</p>
            <p className="text-xs text-muted-foreground">Chapters</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{booksCompleted}</p>
            <p className="text-xs text-muted-foreground">Books</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{percentage}%</p>
            <p className="text-xs text-muted-foreground">Complete</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-card shadow-sm">
        {menuItems.map((item, index) => {
          const Icon = item.icon
          return (
            <button
              key={item.label}
              className={`flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-secondary/50 ${
                index !== menuItems.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <span className="flex-1 font-medium text-foreground">{item.label}</span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          )
        })}
      </div>

      <div className="rounded-xl bg-primary/5 p-5">
        <p className="text-center text-sm italic text-muted-foreground">
          &quot;Your word is a lamp for my feet, a light on my path.&quot;
        </p>
        <p className="mt-2 text-center text-xs font-medium text-primary">Psalm 119:105</p>
      </div>
    </div>
  )
}
