"use client"

import { useTheme } from "next-themes"

interface ProgressCircleProps {
  progress: number
  size?: number
  strokeWidth?: number
}

export function ProgressCircle({ progress, size = 160, strokeWidth = 12 }: ProgressCircleProps) {
  const { resolvedTheme } = useTheme()
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  const dublinBlue = resolvedTheme === "dark" ? "oklch(63% 0.05 225)" : "oklch(40% 0.05 225)"

  const rounded = Math.round(progress)
  const strokeColor =
    rounded >= 100
      ? "oklch(50% 0.06 120)"  // Limerick green
      : rounded >= 50
      ? dublinBlue
      : "oklch(72% 0.09 63)"   // Cork amber

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-secondary"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-foreground">{Math.round(progress)}%</span>
        <span className="text-sm text-muted-foreground">Complete</span>
      </div>
    </div>
  )
}
