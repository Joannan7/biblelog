import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.upsert({
      where: { clerkId: clerkUserId },
      update: {},
      create: { clerkId: clerkUserId },
    });

    const selectedPlan = await prisma.selectedPlan.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json(selectedPlan || { userId: user.id, planId: "free-reading" });
  } catch (error) {
    console.error("Error fetching selected plan:", error);
    return NextResponse.json(
      { error: "Failed to fetch selected plan" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.upsert({
      where: { clerkId: clerkUserId },
      update: {},
      create: { clerkId: clerkUserId },
    });

    const { planId } = await request.json();

    const selectedPlan = await prisma.selectedPlan.upsert({
      where: { userId: user.id },
      update: { planId },
      create: { userId: user.id, planId },
    });

    return NextResponse.json(selectedPlan);
  } catch (error) {
    console.error("Error updating selected plan:", error);
    return NextResponse.json(
      { error: "Failed to update selected plan" },
      { status: 500 }
    );
  }
}
