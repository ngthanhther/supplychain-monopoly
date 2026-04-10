"use client"

import { CostBreakdown as CostBreakdownType, Team } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { formatCurrency, getTeamColorClass, cn } from "@/lib/utils"
import { Info } from "lucide-react"

interface CostBreakdownProps {
  costBreakdowns: CostBreakdownType[]
  teams: Team[]
  round: number
  showDetails?: boolean
}

export function CostBreakdownComponent({
  costBreakdowns,
  teams,
  round,
  showDetails = false,
}: CostBreakdownProps) {
  // Filter to current round
  const roundBreakdowns = costBreakdowns.filter((cb) => cb.round === round)

  if (roundBreakdowns.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Round {round} Cost Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No cost data available yet. Close the round to calculate costs.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          Round {round} Cost Summary
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p className="text-xs">
                  Total Cost = Fixed + Variable + Transport + Taxes + Penalties +
                  Service Fees - Subsidies - Bonuses
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team</TableHead>
              <TableHead className="text-right">Fixed</TableHead>
              <TableHead className="text-right">Variable</TableHead>
              <TableHead className="text-right">Transport</TableHead>
              <TableHead className="text-right">Taxes</TableHead>
              <TableHead className="text-right">Penalties</TableHead>
              <TableHead className="text-right">Service Fees</TableHead>
              <TableHead className="text-right">Subsidies</TableHead>
              <TableHead className="text-right">Bonuses</TableHead>
              <TableHead className="text-right font-bold">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roundBreakdowns.map((breakdown) => {
              const team = teams.find((t) => t.id === breakdown.teamId)
              return (
                <TableRow key={breakdown.teamId}>
                  <TableCell className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-3 h-3 rounded-full",
                        getTeamColorClass(breakdown.teamId)
                      )}
                    />
                    <span className="font-medium">{team?.name}</span>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ${formatCurrency(breakdown.fixedCost)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ${formatCurrency(breakdown.variableCost)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ${formatCurrency(breakdown.transportCost)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ${formatCurrency(breakdown.taxesPaid)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ${formatCurrency(breakdown.penaltiesPaid)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ${formatCurrency(breakdown.serviceFeesPaid)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-green-600">
                    -${formatCurrency(breakdown.subsidiesReceived)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-green-600">
                    -${formatCurrency(breakdown.bonusesReceived)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold">
                    ${formatCurrency(breakdown.totalCost)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        {/* Detailed facility breakdowns */}
        {showDetails &&
          roundBreakdowns.map((breakdown) => {
            const team = teams.find((t) => t.id === breakdown.teamId)
            if (breakdown.facilityBreakdowns.length === 0) return null

            return (
              <div key={breakdown.teamId} className="mt-4 space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      getTeamColorClass(breakdown.teamId)
                    )}
                  />
                  {team?.name} - Facility Details
                </h4>
                <div className="text-xs space-y-2 pl-4">
                  {breakdown.facilityBreakdowns.map((fb) => (
                    <div key={fb.facilityId} className="border-l-2 pl-3 py-1">
                      <p className="font-medium">{fb.facilityName}</p>
                      <p className="text-muted-foreground">
                        Fixed: ${formatCurrency(fb.fixedCost)} | Variable: $
                        {formatCurrency(fb.variableCost)} | Transport: $
                        {formatCurrency(fb.transportCost)} | Units: {fb.unitsServed}
                      </p>
                      {fb.allocations.length > 0 && (
                        <div className="mt-1 text-muted-foreground">
                          {fb.allocations.map((alloc) => (
                            <span key={alloc.zoneId} className="mr-3">
                              Zone {alloc.zoneId}: {alloc.units} units (dist:{" "}
                              {alloc.distance})
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
      </CardContent>
    </Card>
  )
}
