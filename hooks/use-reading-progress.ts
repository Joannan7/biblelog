"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useUser } from "@clerk/nextjs"
import { bibleBooks } from "@/data/bible-data"

const PLAN_ID = "fall-challenge"
const STORAGE_KEY = "bible-reading-progress-fall-challenge"

export function useReadingProgress() {
  const { user, isLoaded: isUserLoaded } = useUser()
  const [readChapters, setReadChapters] = useState<Record<string, boolean[]>>({})
  const [isLoaded, setIsLoaded] = useState(false)
  // Keep a ref so toggleChapter can read current state without stale closures
  const readChaptersRef = useRef(readChapters)
  readChaptersRef.current = readChapters

  useEffect(() => {
    if (!isUserLoaded) return

    if (!user) {
      const saved = localStorage.getItem(STORAGE_KEY)
      try {
        setReadChapters(saved ? JSON.parse(saved) : {})
      } catch {
        setReadChapters({})
      }
      setIsLoaded(true)
      return
    }

    setIsLoaded(false)
    fetch(`/api/progress?planId=${PLAN_ID}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const chapters: Record<string, boolean[]> = {}
          data.forEach((p: { book: string; chapter: number; completed: boolean }) => {
            if (!chapters[p.book]) {
              const book = bibleBooks.find((b) => b.name === p.book)
              chapters[p.book] = Array(book?.chapters || 0).fill(false)
            }
            chapters[p.book][p.chapter - 1] = p.completed
          })
          setReadChapters(chapters)
        } else {
          setReadChapters({})
        }
      })
      .catch(() => setReadChapters({}))
      .finally(() => setIsLoaded(true))
  }, [user, isUserLoaded])

  const toggleChapter = useCallback((bookName: string, chapterIndex: number) => {
    const current = readChaptersRef.current
    const book = bibleBooks.find((b) => b.name === bookName)
    if (!book) return

    const chapters = current[bookName] || Array(book.chapters).fill(false)
    const updated = [...chapters]
    updated[chapterIndex] = !updated[chapterIndex]
    const newCompleted = updated[chapterIndex]
    const newState = { ...current, [bookName]: updated }

    setReadChapters(newState)

    if (!user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
      return
    }

    fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        changes: [{ planId: PLAN_ID, book: bookName, chapter: chapterIndex + 1, completed: newCompleted }],
      }),
    }).catch((err) => console.error("Failed to save progress:", err))
  }, [user])

  return { readChapters, isLoaded, toggleChapter }
}
