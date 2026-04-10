"use client"

import { useEffect, useState } from "react"
import { useGameStore } from "@/lib/game-store"
import { GameBoard } from "@/components/game-board"
import { TeamCard } from "@/components/team-card"
import { AdminActionsPanel } from "@/components/admin-actions-panel"
import { DemandAllocationMatrix } from "@/components/demand-allocation-matrix"
import { CostBreakdownComponent } from "@/components/cost-breakdown"
import { ActionLog } from "@/components/action-log"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getTeamRankings, calculateAllTeamCosts } from "@/lib/calculations"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import {
  Plus,
  Settings,
  History,
  Eye,
  Trophy,
  RotateCcw,
} from "lucide-react"

export default function AdminDashboard() {
  const {
    currentSession,
    loadDemoSession,
    createSession,
    allocateDemand,
    removeAllocation,
  } = useGameStore()

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  // No session - show create/load options
  if (!currentSession) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold">Supply Chain Monopoly</h1>
            <nav className="flex items-center gap-2">
              <Link href="/settings">
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4 mr-1" />
                  Settings
                </Button>
              </Link>
              <Link href="/history">
                <Button variant="ghost" size="sm">
                  <History className="h-4 w-4 mr-1" />
                  History
                </Button>
              </Link>
            </nav>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Welcome, Admin</h2>
              <p className="text-muted-foreground">
                Create a new session or load the demo to get started
              </p>
            </div>

            <div className="grid gap-4">
              <Card className="cursor-pointer hover:border-primary transition-colors">
                <CardContent className="p-6">
                  <Button
                    onClick={() => createSession("New Session")}
                    className="w-full"
                    size="lg"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create New Session
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:border-primary transition-colors">
                <CardContent className="p-6">
                  <Button
                    onClick={() => loadDemoSession()}
                    variant="secondary"
                    className="w-full"
                    size="lg"
                  >
                    <RotateCcw className="h-5 w-5 mr-2" />
                    Load Demo Session
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Pre-configured session with sample data
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Active session - show dashboard
  const rankings = getTeamRankings(currentSession)
  const currentCosts = calculateAllTeamCosts(currentSession, currentSession.currentRound)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold">{currentSession.name}</h1>
            <Badge
              variant={
                currentSession.status === "active"
                  ? "success"
                  : currentSession.status === "completed"
                    ? "default"
                    : "secondary"
              }
            >
              {currentSession.status}
            </Badge>
            <Badge variant="outline">
              Round {currentSession.currentRound}/{currentSession.totalRounds}
            </Badge>
          </div>
          <nav className="flex items-center gap-2">
            <Link href="/viewer" target="_blank">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                Viewer
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/history">
              <Button variant="ghost" size="sm">
                <History className="h-4 w-4" />
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-12 gap-4">
          {/* Left Column - Board and Allocations */}
          <div className="col-span-12 lg:col-span-8 space-y-4">
            {/* Board */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Game Board</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center overflow-x-auto">
                <GameBoard
                  teams={currentSession.teams}
                  facilityOwnerships={currentSession.facilityOwnerships}
                  session={currentSession}
                />
              </CardContent>
            </Card>

            {/* Tabs for Allocations and Costs */}
            <Tabs defaultValue="allocations">
              <TabsList>
                <TabsTrigger value="allocations">Demand Allocations</TabsTrigger>
                <TabsTrigger value="costs">Cost Summary</TabsTrigger>
                <TabsTrigger value="log">Activity Log</TabsTrigger>
              </TabsList>

              <TabsContent value="allocations" className="mt-4">
                <DemandAllocationMatrix
                  session={currentSession}
                  onAllocate={allocateDemand}
                  onRemoveAllocation={removeAllocation}
                />
              </TabsContent>

              <TabsContent value="costs" className="mt-4">
                {currentSession.costSummaries.length > 0 ? (
                  <div className="space-y-4">
                    {/* Previous round summaries */}
                    {Array.from(
                      { length: currentSession.currentRound - 1 },
                      (_, i) => i + 1
                    )
                      .reverse()
                      .map((round) => (
                        <CostBreakdownComponent
                          key={round}
                          costBreakdowns={currentSession.costSummaries}
                          teams={currentSession.teams}
                          round={round}
                          showDetails
                        />
                      ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      No cost summaries yet. Complete a round to see cost breakdowns.
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="log" className="mt-4">
                <ActionLog
                  logs={currentSession.transactionLogs}
                  teams={currentSession.teams}
                  maxHeight="400px"
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Actions and Teams */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            {/* Admin Actions */}
            <AdminActionsPanel session={currentSession} />

            {/* Leaderboard */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {rankings.map((ranking) => {
                  const team = currentSession.teams.find(
                    (t) => t.id === ranking.teamId
                  )!
                  return (
                    <div
                      key={ranking.teamId}
                      className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg w-6">
                          #{ranking.rank}
                        </span>
                        <span className="font-medium">{team.name}</span>
                      </div>
                      <span className="font-mono">
                        ${formatCurrency(ranking.totalCost)}
                      </span>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Team Cards */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Teams</h3>
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
          </div>
        </div>
      </main>
    </div>
  )
}
