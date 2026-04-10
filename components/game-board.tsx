"use client"

import { BOARD_CELLS, CUSTOMER_ZONES, FACILITIES, getFacilityById } from "@/lib/game-data"
import type { Team, FacilityOwnership, ZoneId, GameSession } from "@/lib/types"
import { cn, getTeamColorClass } from "@/lib/utils"
import { getEffectiveDemand } from "@/lib/calculations"
import {
  Building2,
  Sparkles,
  AlertTriangle,
  Receipt,
  Briefcase,
  Gavel,
  ParkingCircle,
  TrendingUp,
  Handshake,
  Play,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface GameBoardProps {
  teams: Team[]
  facilityOwnerships: FacilityOwnership[]
  session?: GameSession
  onCellClick?: (cellIndex: number) => void
  selectedCell?: number | null
  compact?: boolean
}

const cellTypeIcons: Record<string, React.ReactNode> = {
  start: <Play className="h-4 w-4" />,
  facility: <Building2 className="h-4 w-4" />,
  opportunity: <Sparkles className="h-4 w-4" />,
  risk: <AlertTriangle className="h-4 w-4" />,
  "income-tax": <Receipt className="h-4 w-4" />,
  "luxury-tax": <Briefcase className="h-4 w-4" />,
  jail: <Gavel className="h-4 w-4" />,
  "free-parking": <ParkingCircle className="h-4 w-4" />,
  "market-review": <TrendingUp className="h-4 w-4" />,
  negotiation: <Handshake className="h-4 w-4" />,
}

const cellTypeColors: Record<string, string> = {
  start: "bg-emerald-100 border-emerald-300",
  facility: "bg-white border-slate-200",
  opportunity: "bg-green-50 border-green-300",
  risk: "bg-amber-50 border-amber-300",
  "income-tax": "bg-red-50 border-red-300",
  "luxury-tax": "bg-purple-50 border-purple-300",
  jail: "bg-slate-100 border-slate-400",
  "free-parking": "bg-orange-50 border-orange-300",
  "market-review": "bg-sky-50 border-sky-300",
  negotiation: "bg-indigo-50 border-indigo-300",
}

const zoneColors: Record<ZoneId, string> = {
  A: "bg-rose-100 border-rose-300 text-rose-800",
  B: "bg-blue-100 border-blue-300 text-blue-800",
  C: "bg-teal-100 border-teal-300 text-teal-800",
  D: "bg-amber-100 border-amber-300 text-amber-800",
}

export function GameBoard({
  teams,
  facilityOwnerships,
  session,
  onCellClick,
  selectedCell,
  compact = false,
}: GameBoardProps) {
  // Board layout: 16 cells around perimeter
  // Top row: 0, 1, 2, 3, 4 (indices 0-4)
  // Right column: 5, 6, 7, 8 (indices 5-8)
  // Bottom row: 9, 10, 11, 12 (indices 9-12, reversed visually)
  // Left column: 13, 14, 15 (indices 13-15)

  const topRow = [0, 1, 2, 3, 4]
  const rightCol = [5, 6, 7, 8]
  const bottomRow = [12, 11, 10, 9]
  const leftCol = [15, 14, 13]

  const getTeamsOnCell = (cellIndex: number) => {
    return teams.filter((t) => t.position === cellIndex)
  }

  const getOwnership = (facilityId: number | undefined) => {
    if (!facilityId) return null
    return facilityOwnerships.find((o) => o.facilityId === facilityId)
  }

  const renderCell = (cellIndex: number, position: "corner" | "edge") => {
    const cell = BOARD_CELLS[cellIndex]
    const teamsOnCell = getTeamsOnCell(cellIndex)
    const ownership = getOwnership(cell.facilityId)
    const facility = cell.facilityId ? getFacilityById(cell.facilityId) : null

    const isSelected = selectedCell === cellIndex
    const isClickable = !!onCellClick

    return (
      <TooltipProvider key={cellIndex}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "board-cell border-2 rounded-lg cursor-default transition-all",
                cellTypeColors[cell.type],
                position === "corner"
                  ? compact
                    ? "w-16 h-16"
                    : "w-20 h-20"
                  : compact
                    ? "w-14 h-14"
                    : "w-16 h-16",
                isSelected && "ring-2 ring-primary ring-offset-2",
                isClickable && "cursor-pointer hover:scale-105",
                ownership?.isFrozen && "bg-red-100 border-red-400"
              )}
              onClick={() => onCellClick?.(cellIndex)}
            >
              {/* Owner indicator */}
              {ownership?.ownerId && (
                <div
                  className={cn(
                    "absolute top-0.5 right-0.5 w-3 h-3 rounded-full border border-white",
                    getTeamColorClass(ownership.ownerId)
                  )}
                />
              )}

              {/* Upgraded badge */}
              {ownership?.isUpgraded && (
                <div className="absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-upgraded border border-white flex items-center justify-center">
                  <span className="text-[6px] text-white font-bold">U</span>
                </div>
              )}

              {/* Frozen indicator */}
              {ownership?.isFrozen && (
                <div className="absolute bottom-0.5 right-0.5 text-[8px] text-red-600 font-bold">
                  F
                </div>
              )}

              {/* Icon */}
              <div className="text-muted-foreground mb-0.5">
                {cellTypeIcons[cell.type]}
              </div>

              {/* Name */}
              <span
                className={cn(
                  "text-center leading-tight font-medium",
                  compact ? "text-[7px]" : "text-[8px]"
                )}
              >
                {facility ? facility.name.split(" ")[0] : cell.name}
              </span>

              {/* Team tokens */}
              {teamsOnCell.length > 0 && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                  {teamsOnCell.map((team) => (
                    <div
                      key={team.id}
                      className={cn("team-token", getTeamColorClass(team.id))}
                      title={team.name}
                    />
                  ))}
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-1">
              <p className="font-semibold">{cell.name}</p>
              {cell.description && (
                <p className="text-xs text-muted-foreground">{cell.description}</p>
              )}
              {facility && (
                <div className="text-xs space-y-0.5">
                  <p>Purchase: ${facility.purchasePrice}</p>
                  <p>Fixed Cost: ${facility.fixedCost}/round</p>
                  <p>Variable Cost: ${facility.variableCost}/unit</p>
                  <p>Capacity: {facility.capacity} units</p>
                  {ownership?.ownerId && (
                    <p className="font-medium">
                      Owner: {teams.find((t) => t.id === ownership.ownerId)?.name}
                    </p>
                  )}
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  const renderCustomerZone = (zoneId: ZoneId) => {
    const zone = CUSTOMER_ZONES.find((z) => z.id === zoneId)!
    const demand = session
      ? getEffectiveDemand(session, zoneId, session.currentRound)
      : 0

    return (
      <TooltipProvider key={zoneId}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "flex flex-col items-center justify-center rounded-xl border-2 p-2 transition-all hover:scale-105",
                zoneColors[zoneId],
                compact ? "w-20 h-16" : "w-24 h-20"
              )}
            >
              <span className={cn("font-bold", compact ? "text-lg" : "text-xl")}>
                {zoneId}
              </span>
              <span className={cn("font-medium", compact ? "text-xs" : "text-sm")}>
                {demand} units
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-semibold">{zone.name}</p>
              <p className="text-xs text-muted-foreground">{zone.description}</p>
              <p className="text-sm">Demand: {demand} units</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <div className={cn("inline-block", compact ? "p-2" : "p-4")}>
      {/* Top Row */}
      <div className="flex gap-1 justify-center mb-1">
        {topRow.map((idx) =>
          renderCell(idx, idx === 0 || idx === 4 ? "corner" : "edge")
        )}
      </div>

      {/* Middle Section: Left column, Center zones, Right column */}
      <div className="flex gap-1">
        {/* Left Column */}
        <div className="flex flex-col gap-1">
          {leftCol.map((idx) => renderCell(idx, "edge"))}
        </div>

        {/* Center - Customer Zones */}
        <div
          className={cn(
            "flex-1 grid grid-cols-2 gap-2 items-center justify-items-center bg-muted/30 rounded-xl border border-dashed border-muted-foreground/30",
            compact ? "p-3 mx-1" : "p-4 mx-2"
          )}
        >
          {renderCustomerZone("A")}
          {renderCustomerZone("B")}
          {renderCustomerZone("C")}
          {renderCustomerZone("D")}
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-1">
          {rightCol.map((idx) => renderCell(idx, "edge"))}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="flex gap-1 justify-center mt-1">
        {bottomRow.map((idx) =>
          renderCell(idx, idx === 9 || idx === 12 ? "corner" : "edge")
        )}
      </div>
    </div>
  )
}
