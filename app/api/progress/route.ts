import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { getOrCreateUser } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await getOrCreateUser(clerkUserId)
    const { searchParams } = new URL(request.url)
    const planId = searchParams.get("planId")

    const progress = await prisma.readingProgress.findMany({
      where: { userId: user.id, ...(planId ? { planId } : {}) },
    })

    return NextResponse.json(progress)
  } catch (error) {
    console.error("Error fetching progress:", error)
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await getOrCreateUser(clerkUserId)
    const { changes } = await request.json()

    if (!Array.isArray(changes)) {
      return NextResponse.json({ error: "Expected changes array" }, { status: 400 })
    }

    const updates = await Promise.all(
      changes.map((change) =>
        prisma.readingProgress.upsert({
          where: {
            userId_planId_book_chapter: {
              userId: user.id,
              planId: change.planId,
              book: change.book,
              chapter: change.chapter,
            },
          },
          update: { completed: change.completed },
          create: {
            userId: user.id,
            planId: change.planId,
            book: change.book,
            chapter: change.chapter,
            completed: change.completed,
          },
        })
      )
    )

    return NextResponse.json({ saved: updates.length })
  } catch (error) {
    console.error("Error updating progress:", error)
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 })
  }
}
