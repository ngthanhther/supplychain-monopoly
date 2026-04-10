"use client"

import { useEffect, useState } from "react"
import { useGameStore } from "@/lib/game-store"
import { GameBoard } from "@/components/game-board"
import { TeamCard } from "@/components/team-card"
import { ActionLog } from "@/components/action-log"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getTeamRankings, getEffectiveDemand } from "@/lib/calculations"
import { CUSTOMER_ZONES, FACILITIES, getFacilityById } from "@/lib/game-data"
import { cn, formatCurrency, getTeamColorClass } from "@/lib/utils"
import type { ZoneId } from "@/lib/types"
import Link from "next/link"
import {
  Trophy,
  Building2,
  Target,
  RefreshCw,
  Maximize,
  Home,
  Sparkles,
  AlertTriangle,
} from "lucide-react"

export default function ViewerDashboard() {
  const { currentSession } = useGameStore()
  const [mounted, setMounted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date())
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!currentSession) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <h1 className="text-2xl font-bold">No Active Session</h1>
        <p className="text-muted-foreground">
          Waiting for admin to start a session...
        </p>
        <Link href="/">
          <Button variant="outline">
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        </Link>
      </div>
    )
  }

  const rankings = getTeamRankings(currentSession)
  const currentTeam = currentSession.teams.find(
    (t) => t.id === currentSession.currentTeamTurn
  )

  // Get active events for current round
  const activeEvents = currentSession.appliedEvents.filter(
    (e) => e.round === currentSession.currentRound
  )

  // Get zones with demand info
  const zones: ZoneId[] = ["A", "B", "C", "D"]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">{currentSession.name}</h1>
            <Badge
              variant={
                currentSession.status === "active"
                  ? "success"
                  : currentSession.status === "completed"
                    ? "default"
                    : "secondary"
              }
              className="text-sm"
            >
              {currentSession.status.toUpperCase()}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-lg px-4 py-1">
              Round {currentSession.currentRound}/{currentSession.totalRounds}
            </Badge>
            <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
              <Maximize className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLastUpdate(new Date())}
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Active Events Banner */}
      {activeEvents.length > 0 && (
        <div className="bg-amber-50 border-b border-amber-200 py-2">
          <div className="container mx-auto px-4 flex items-center gap-4 overflow-x-auto">
            <span className="text-sm font-medium text-amber-800 flex items-center gap-1 shrink-0">
              <Sparkles className="h-4 w-4" />
              Active Events:
            </span>
            {activeEvents.map((event) => {
              const team = currentSession.teams.find((t) => t.id === event.teamId)
              const facility = event.facilityId
                ? getFacilityById(event.facilityId)
                : null
              return (
                <Badge
                  key={event.id}
                  variant={
                    event.cardId.startsWith("opp") ? "success" : "warning"
                  }
                  className="shrink-0"
                >
                  {event.cardId} - {team?.name}
                  {facility && ` (${facility.name})`}
                  {event.zoneId && ` (Zone ${event.zoneId})`}
                </Badge>
              )
            })}
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-12 gap-4">
          {/* Left Section - Board */}
          <div className="col-span-12 xl:col-span-7 space-y-4">
            {/* Current Turn Banner */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="py-4">
                <div className="flex items-center justify-center gap-4">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full",
                      getTeamColorClass(currentSession.currentTeamTurn)
                    )}
                  />
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Current Turn</p>
                    <p className="text-2xl font-bold">{currentTeam?.name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Game Board */}
            <Card>
              <CardContent className="p-4 flex justify-center">
                <GameBoard
                  teams={currentSession.teams}
                  facilityOwnerships={currentSession.facilityOwnerships}
                  session={currentSession}
                />
              </CardContent>
            </Card>

            {/* Customer Zones Summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Customer Zone Demand
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-3">
                  {zones.map((zoneId) => {
                    const zone = CUSTOMER_ZONES.find((z) => z.id === zoneId)!
                    const demand = getEffectiveDemand(
                      currentSession,
                      zoneId,
                      currentSession.currentRound
                    )
                    const allocated = currentSession.allocations
                      .filter((a) => a.zoneId === zoneId)
                      .reduce((sum, a) => sum + a.units, 0)
                    const progress = demand > 0 ? (allocated / demand) * 100 : 0

                    return (
                      <div
                        key={zoneId}
                        className={cn(
                          "p-4 rounded-lg border-2 text-center",
                          progress >= 100
                            ? "bg-green-50 border-green-300"
                            : "bg-amber-50 border-amber-300"
                        )}
                      >
                        <div className="text-2xl font-bold">{zoneId}</div>
                        <div className="text-sm text-muted-foreground">
                          {zone.name.split(" ")[0]}
                        </div>
                        <div className="mt-2 text-lg font-mono">
                          {allocated}/{demand}
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full mt-2">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              progress >= 100 ? "bg-green-500" : "bg-amber-500"
                            )}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Section - Rankings and Info */}
          <div className="col-span-12 xl:col-span-5 space-y-4">
            {/* Leaderboard */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  Leaderboard (Lowest Cost Wins)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {rankings.map((ranking, idx) => {
                  const team = currentSession.teams.find(
                    (t) => t.id === ranking.teamId
                  )!
                  return (
                    <div
                      key={ranking.teamId}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg",
                        idx === 0
                          ? "bg-yellow-50 border border-yellow-200"
                          : "bg-muted/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "text-2xl font-bold w-8",
                            idx === 0 && "text-yellow-600"
                          )}
                        >
                          {ranking.rank}
                        </span>
                        <div
                          className={cn(
                            "w-6 h-6 rounded-full",
                            getTeamColorClass(team.id)
                          )}
                        />
                        <span className="font-semibold text-lg">{team.name}</span>
                      </div>
                      <span className="font-mono text-xl">
                        ${formatCurrency(ranking.totalCost)}
                      </span>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Facility Status */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Facility Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {FACILITIES.map((facility) => {
                    const ownership = currentSession.facilityOwnerships.find(
                      (o) => o.facilityId === facility.id
                    )
                    const owner = ownership?.ownerId
                      ? currentSession.teams.find(
                          (t) => t.id === ownership.ownerId
                        )
                      : null

                    return (
                      <div
                        key={facility.id}
                        className={cn(
                          "p-2 rounded-lg border",
                          ownership?.isFrozen
                            ? "bg-red-50 border-red-200"
                            : owner
                              ? "bg-card"
                              : "bg-muted/30"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          {owner && (
                            <div
                              className={cn(
                                "w-3 h-3 rounded-full shrink-0",
                                getTeamColorClass(owner.id)
                              )}
                            />
                          )}
                          <span className="font-medium text-sm truncate">
                            {facility.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {ownership?.isUpgraded && (
                            <Badge variant="upgraded" className="text-[10px] px-1">
                              Upgraded
                            </Badge>
                          )}
                          {ownership?.isFrozen && (
                            <Badge variant="frozen" className="text-[10px] px-1">
                              Frozen
                            </Badge>
                          )}
                          {!owner && (
                            <span className="text-xs text-muted-foreground">
                              Available
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Team Cards */}
            <div className="grid grid-cols-2 gap-2">
              {currentSession.teams.map((team) => {
                const ranking = rankings.find((r) => r.teamId === team.id)
                return (
                  <TeamCard
                    key={team.id}
                    team={team}
                    facilityOwnerships={currentSession.facilityOwnerships}
                    rank={ranking?.rank}
                    isCurrentTurn={team.id === currentSession.currentTeamTurn}
                    compact
                  />
                )
              })}
            </div>

            {/* Recent Activity */}
            <ActionLog
              logs={currentSession.transactionLogs}
              teams={currentSession.teams}
              maxHeight="200px"
              showRoundFilter
              currentRound={currentSession.currentRound}
            />
          </div>
        </div>
      </main>

      {/* Footer with timestamp */}
      <footer className="fixed bottom-0 left-0 right-0 bg-muted/80 backdrop-blur border-t py-2">
        <div className="container mx-auto px-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>Supply Chain Monopoly - Viewer Mode</span>
          <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
        </div>
      </footer>
    </div>
  )
}
