"use client"

import { useState } from "react"
import type { GameSession, TeamId, ZoneId, DemandAllocation } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CUSTOMER_ZONES, FACILITIES, getFacilityById } from "@/lib/game-data"
import {
  getEffectiveDemand,
  getTotalAllocatedForZone,
  getRemainingCapacity,
  getEffectiveCapacity,
  validateRoundAllocations,
} from "@/lib/calculations"
import { cn, formatCurrency, getTeamColorClass } from "@/lib/utils"
import { Plus, Trash2, AlertTriangle, CheckCircle } from "lucide-react"

interface DemandAllocationMatrixProps {
  session: GameSession
  onAllocate: (allocation: DemandAllocation) => void
  onRemoveAllocation: (teamId: TeamId, zoneId: ZoneId, facilityId: number) => void
  readOnly?: boolean
}

export function DemandAllocationMatrix({
  session,
  onAllocate,
  onRemoveAllocation,
  readOnly = false,
}: DemandAllocationMatrixProps) {
  const [selectedTeam, setSelectedTeam] = useState<TeamId | "">("")
  const [selectedZone, setSelectedZone] = useState<ZoneId | "">("")
  const [selectedFacility, setSelectedFacility] = useState<number | "">("")
  const [units, setUnits] = useState("")

  const round = session.currentRound

  // Get team's owned facilities
  const getTeamFacilities = (teamId: TeamId) => {
    return session.facilityOwnerships
      .filter((o) => o.ownerId === teamId && !o.isFrozen)
      .map((o) => getFacilityById(o.facilityId)!)
      .filter(Boolean)
  }

  const handleAddAllocation = () => {
    if (!selectedTeam || !selectedZone || !selectedFacility || !units) return

    const unitsNum = parseInt(units)
    if (isNaN(unitsNum) || unitsNum <= 0) return

    onAllocate({
      teamId: selectedTeam,
      zoneId: selectedZone,
      facilityId: selectedFacility,
      units: unitsNum,
    })

    // Reset form
    setUnits("")
  }

  // Validation
  const validation = validateRoundAllocations(session, round)

  // Group allocations by zone
  const zones: ZoneId[] = ["A", "B", "C", "D"]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span>Demand Allocation - Round {round}</span>
          {validation.isValid ? (
            <Badge variant="success" className="gap-1">
              <CheckCircle className="h-3 w-3" />
              Valid
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              {validation.errors.length} Error(s)
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Validation errors */}
        {validation.errors.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {validation.errors.map((error, idx) => (
                  <li key={idx}>{error.message}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Validation warnings */}
        {validation.warnings.length > 0 && (
          <Alert variant="warning">
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {validation.warnings.map((warning, idx) => (
                  <li key={idx}>{warning.message}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Add allocation form */}
        {!readOnly && (
          <div className="flex flex-wrap gap-2 items-end">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Team</label>
              <Select
                value={selectedTeam.toString()}
                onValueChange={(v) => {
                  setSelectedTeam(parseInt(v) as TeamId)
                  setSelectedFacility("")
                }}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {session.teams.map((team) => (
                    <SelectItem key={team.id} value={team.id.toString()}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Zone</label>
              <Select
                value={selectedZone}
                onValueChange={(v) => setSelectedZone(v as ZoneId)}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Zone" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((zoneId) => {
                    const demand = getEffectiveDemand(session, zoneId, round)
                    const allocated = getTotalAllocatedForZone(
                      session.allocations,
                      zoneId,
                      round
                    )
                    return (
                      <SelectItem key={zoneId} value={zoneId}>
                        {zoneId} ({allocated}/{demand})
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Facility</label>
              <Select
                value={selectedFacility.toString()}
                onValueChange={(v) => setSelectedFacility(parseInt(v))}
                disabled={!selectedTeam}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Select facility" />
                </SelectTrigger>
                <SelectContent>
                  {selectedTeam &&
                    getTeamFacilities(selectedTeam).map((facility) => {
                      const ownership = session.facilityOwnerships.find(
                        (o) => o.facilityId === facility.id
                      )!
                      const capacity = getEffectiveCapacity(
                        facility.id,
                        ownership,
                        session.appliedEvents,
                        round
                      )
                      const remaining = getRemainingCapacity(session, facility.id, round)
                      return (
                        <SelectItem key={facility.id} value={facility.id.toString()}>
                          {facility.name.split(" ")[0]} ({remaining}/{capacity})
                        </SelectItem>
                      )
                    })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Units</label>
              <Input
                type="number"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                placeholder="0"
                className="w-[80px]"
              />
            </div>

            <Button
              onClick={handleAddAllocation}
              size="sm"
              disabled={!selectedTeam || !selectedZone || !selectedFacility || !units}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        )}

        {/* Demand summary by zone */}
        <div className="grid grid-cols-4 gap-2">
          {zones.map((zoneId) => {
            const zone = CUSTOMER_ZONES.find((z) => z.id === zoneId)!
            const demand = getEffectiveDemand(session, zoneId, round)
            const allocated = getTotalAllocatedForZone(
              session.allocations,
              zoneId,
              round
            )
            const remaining = demand - allocated
            const isFulfilled = remaining <= 0

            return (
              <div
                key={zoneId}
                className={cn(
                  "p-2 rounded-lg border text-center",
                  isFulfilled
                    ? "bg-green-50 border-green-200"
                    : "bg-amber-50 border-amber-200"
                )}
              >
                <div className="font-medium">Zone {zoneId}</div>
                <div className="text-xs text-muted-foreground">{zone.name}</div>
                <div className="mt-1 font-mono text-sm">
                  {allocated}/{demand}
                </div>
                {remaining > 0 && (
                  <div className="text-xs text-amber-600">{remaining} remaining</div>
                )}
              </div>
            )
          })}
        </div>

        {/* Allocations table */}
        {session.allocations.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Facility</TableHead>
                <TableHead className="text-right">Units</TableHead>
                <TableHead className="text-right">Distance</TableHead>
                <TableHead className="text-right">Transport Cost</TableHead>
                {!readOnly && <TableHead className="w-[50px]" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {session.allocations.map((alloc, idx) => {
                const team = session.teams.find((t) => t.id === alloc.teamId)
                const facility = getFacilityById(alloc.facilityId)
                const distance = facility?.distances[alloc.zoneId] || 0
                const transportCost =
                  alloc.units * distance * session.transportRate

                return (
                  <TableRow key={idx}>
                    <TableCell className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          getTeamColorClass(alloc.teamId)
                        )}
                      />
                      {team?.name}
                    </TableCell>
                    <TableCell>{alloc.zoneId}</TableCell>
                    <TableCell>{facility?.name}</TableCell>
                    <TableCell className="text-right font-mono">
                      {alloc.units}
                    </TableCell>
                    <TableCell className="text-right">{distance}</TableCell>
                    <TableCell className="text-right font-mono">
                      ${formatCurrency(transportCost)}
                    </TableCell>
                    {!readOnly && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() =>
                            onRemoveAllocation(
                              alloc.teamId,
                              alloc.zoneId,
                              alloc.facilityId
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}

        {session.allocations.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No allocations yet. Add demand allocations above.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
