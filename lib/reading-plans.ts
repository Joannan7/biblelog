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
    id: "summer-challenge",
    name: "Summer Reading Challenge",
    description: "Complete the Bible in a fun summer challenge",
    days: [
      { date: "June 1", chapters: [{ book: "Genesis", chapter: 1 }, { book: "Genesis", chapter: 2 }] },
      { date: "June 2", chapters: [{ book: "Genesis", chapter: 3 }] },
      // Add more dates...
    ]
  },
  {
    id: "one-chapter",
    name: "One Chapter a Day",
    description: "Read one chapter per day through the entire Bible",
    days: [
      // Generate programmatically or list them
      { day: 1, chapters: [{ book: "Genesis", chapter: 1 }] },
      { day: 2, chapters: [{ book: "Genesis", chapter: 2 }] },
      // Continue for all chapters...
    ]
  }
]