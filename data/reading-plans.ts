export interface ReadingPlan {
  id: string
  name: string
  description: string
  days: {
    day?: number
    date?: string
    chapters: { book: string; chapter: number }[]
  }[]
}

export const readingPlans: ReadingPlan[] = [
  {
    id: "fall-challenge",
    name: "Fall Reading Challenge",
    description: "Read through the Bible together this fall",
    days: [
      { date: "Sept 1", chapters: [{ book: "Genesis", chapter: 1 }, { book: "Genesis", chapter: 2 }] },
      { date: "Sept 2", chapters: [{ book: "Genesis", chapter: 3 }, { book: "Genesis", chapter: 4 }] },
      { date: "Sept 3", chapters: [{ book: "Genesis", chapter: 5 }, { book: "Genesis", chapter: 6 }] },
      { date: "Sept 4", chapters: [{ book: "Genesis", chapter: 7 }, { book: "Genesis", chapter: 8 }] },
      { date: "Sept 5", chapters: [{ book: "Genesis", chapter: 9 }, { book: "Genesis", chapter: 10 }] },
    ]
  },
]
