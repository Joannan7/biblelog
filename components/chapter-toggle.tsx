"use client"

import { Check } from "lucide-react"

interface ChapterToggleProps {
  chapter: number
  isRead: boolean
  onToggle: () => void
}

export function ChapterToggle({ chapter, isRead, onToggle }: ChapterToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-all ${
        isRead
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-secondary-foreground hover:bg-primary/20"
      }`}
    >
      {isRead ? <Check className="h-5 w-5" /> : chapter}
    </button>
  )
}
