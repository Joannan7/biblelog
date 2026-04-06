import { readingPlans } from "@/lib/reading-plans"
import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json(readingPlans)
}