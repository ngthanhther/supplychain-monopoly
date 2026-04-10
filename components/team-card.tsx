"use client"

import { Team, FacilityOwnership } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn, formatCurrency, getTeamColorClass, getTeamBorderClass } from "@/lib/utils"
import { FACILITIES, getFacilityById } from "@/lib/game-data"
import { Trophy, Building2, MapPin, Lock } from "lucide-react"

interface TeamCardProps {
  team: Team
  facilityOwnerships: FacilityOwnership[]
  rank?: number
  isCurrentTurn?: boolean
  compact?: boolean
}

export function TeamCard({
  team,
  facilityOwnerships,
  rank,
  isCurrentTurn,
  compact = false,
}: TeamCardProps) {
  const ownedFacilities = facilityOwnerships.filter((o) => o.ownerId === team.id)

  return (
    <Card
      className={cn(
        "transition-all",
        isCurrentTurn && "ring-2 ring-primary ring-offset-2",
        getTeamBorderClass(team.id),
        "border-l-4"
      )}
    >
      <CardHeader className={cn("pb-2", compact && "p-3")}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={cn("w-4 h-4 rounded-full", getTeamColorClass(team.id))}
            />
            <CardTitle className={cn("text-base", compact && "text-sm")}>
              {team.name}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {rank && rank <= 3 && (
              <Badge
                variant={rank === 1 ? "default" : "secondary"}
                className="gap-1"
              >
                <Trophy className="h-3 w-3" />
                #{rank}
              </Badge>
            )}
            {isCurrentTurn && (
              <Badge variant="success" className="animate-pulse">
                Current Turn
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className={cn("space-y-3", compact && "p-3 pt-0")}>
        {/* Score */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total Cost</span>
          <span className="font-mono font-semibold text-lg">
            ${formatCurrency(team.score)}
          </span>
        </div>

        {/* Position */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            Position
          </span>
          <span className="font-medium">Cell {team.position}</span>
        </div>

        {/* Jail status */}
        {team.isInJail && (
          <Badge variant="frozen" className="w-full justify-center gap-1">
            <Lock className="h-3 w-3" />
            In Legal Hold ({team.jailTurnsRemaining} turn
            {team.jailTurnsRemaining !== 1 ? "s" : ""})
          </Badge>
        )}

        {/* Owned facilities */}
        {!compact && ownedFacilities.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              Facilities ({ownedFacilities.length})
            </span>
            <div className="flex flex-wrap gap-1">
              {ownedFacilities.map((ownership) => {
                const facility = getFacilityById(ownership.facilityId)
                return (
                  <Badge
                    key={ownership.facilityId}
                    variant={
                      ownership.isFrozen
                        ? "frozen"
                        : ownership.isUpgraded
                          ? "upgraded"
                          : "outline"
                    }
                    className="text-xs"
                  >
                    {facility?.name.split(" ")[0]}
                    {ownership.isUpgraded && " +"}
                    {ownership.isFrozen && " (F)"}
                  </Badge>
                )
              })}
            </div>
          </div>
        )}

        {!compact && ownedFacilities.length === 0 && (
          <p className="text-sm text-muted-foreground italic">No facilities owned</p>
        )}
      </CardContent>
    </Card>
  )
}
