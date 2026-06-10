"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, BookOpen } from "lucide-react"
import { type BibleBook } from "@/data/bible-data"
import { ChapterToggle } from "./chapter-toggle"

interface BookListProps {
  books: BibleBook[]
  readChapters: Record<string, boolean[]>
  onToggleChapter: (bookName: string, chapter: number) => void
}

export function BookList({ books, readChapters, onToggleChapter }: BookListProps) {
  const [expandedBook, setExpandedBook] = useState<string | null>(null)

  const getBookProgress = (book: BibleBook) => {
    const chapters = readChapters[book.name] || []
    const readCount = chapters.filter(Boolean).length
    return Math.round((readCount / book.chapters) * 100)
  }

  const getReadCount = (book: BibleBook) => {
    const chapters = readChapters[book.name] || []
    return chapters.filter(Boolean).length
  }

  return (
    <div className="flex flex-col gap-3">
      {books.map((book) => {
        const isExpanded = expandedBook === book.name
        const progress = getBookProgress(book)
        const readCount = getReadCount(book)

        return (
          <div key={book.name} className="overflow-hidden rounded-xl bg-card shadow-sm">
            <button
              onClick={() => setExpandedBook(isExpanded ? null : book.name)}
              className="flex w-full items-center gap-3 p-4"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-foreground">{book.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {readCount} of {book.chapters} chapters
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-16 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </button>

            {isExpanded && (
              <div className="border-t border-border px-4 pb-4 pt-3">
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: book.chapters }, (_, i) => {
                    const chapterNum = i + 1
                    const isRead = readChapters[book.name]?.[i] || false
                    return (
                      <ChapterToggle
                        key={chapterNum}
                        chapter={chapterNum}
                        isRead={isRead}
                        onToggle={() => onToggleChapter(book.name, i)}
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
  )
}
