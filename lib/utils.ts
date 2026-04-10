import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(num: number, decimals: number = 1): string {
  return num.toFixed(decimals)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

export function getTeamColorClass(teamId: number): string {
  const colors: Record<number, string> = {
    1: "bg-team1",
    2: "bg-team2",
    3: "bg-team3",
    4: "bg-team4",
  }
  return colors[teamId] || "bg-muted"
}

export function getTeamBorderClass(teamId: number): string {
  const colors: Record<number, string> = {
    1: "border-team1",
    2: "border-team2",
    3: "border-team3",
    4: "border-team4",
  }
  return colors[teamId] || "border-muted"
}

export function getTeamTextClass(teamId: number): string {
  const colors: Record<number, string> = {
    1: "text-team1",
    2: "text-team2",
    3: "text-team3",
    4: "text-team4",
  }
  return colors[teamId] || "text-muted-foreground"
}
