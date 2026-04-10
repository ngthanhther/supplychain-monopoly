"use client"

import { useEffect, useState } from "react"
import { useGameStore } from "@/lib/game-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import Link from "next/link"
import {
  History,
  ArrowLeft,
  Play,
  Eye,
  Trash2,
  Copy,
  Trophy,
  Calendar,
  Users,
  Clock,
  Search,
  Filter,
  Download,
  ChevronRight,
} from "lucide-react"
import { cn, formatCurrency, getTeamColorClass } from "@/lib/utils"
import { getTeamRankings } from "@/lib/calculations"
import type { GameSession, Team } from "@/lib/types"

// Seeded historical sessions for demo
const SEEDED_HISTORY: GameSession[] = [
  {
    id: "history-1",
    name: "Spring 2024 - Section A",
    status: "completed",
    currentRound: 4,
    totalRounds: 4,
    currentTeamTurn: "team-1",
    createdAt: new Date("2024-03-15T09:00:00").toISOString(),
    teams: [
      { id: "team-1", name: "Alpha Logistics", color: "#22c55e", position: 12, isInJail: false, passedStart: true },
      { id: "team-2", name: "Beta Supply Co", color: "#3b82f6", position: 8, isInJail: false, passedStart: true },
      { id: "team-3", name: "Gamma Distribution", color: "#f97316", position: 5, isInJail: false, passedStart: true },
      { id: "team-4", name: "Delta Freight", color: "#a855f7", position: 14, isInJail: false, passedStart: true },
    ],
    facilityOwnerships: [
      { facilityId: "facility-1", ownerId: "team-1", isUpgraded: true, isFrozen: false, acquiredRound: 1 },
      { facilityId: "facility-2", ownerId: "team-2", isUpgraded: false, isFrozen: false, acquiredRound: 1 },
      { facilityId: "facility-3", ownerId: "team-1", isUpgraded: false, isFrozen: false, acquiredRound: 2 },
      { facilityId: "facility-4", ownerId: "team-3", isUpgraded: true, isFrozen: false, acquiredRound: 2 },
      { facilityId: "facility-5", ownerId: "team-4", isUpgraded: false, isFrozen: false, acquiredRound: 1 },
      { facilityId: "facility-6", ownerId: "team-2", isUpgraded: true, isFrozen: false, acquiredRound: 3 },
    ],
    allocations: [],
    appliedEvents: [],
    roundSummaries: [
      { round: 1, teamId: "team-1", fixedCost: 500, variableCost: 1500, transportCost: 400, penalties: 0, taxes: 0, subsidies: 0, bonuses: 200, totalCost: 2200 },
      { round: 1, teamId: "team-2", fixedCost: 1200, variableCost: 1800, transportCost: 300, penalties: 0, taxes: 0, subsidies: 0, bonuses: 0, totalCost: 3300 },
      { round: 1, teamId: "team-3", fixedCost: 0, variableCost: 0, transportCost: 0, penalties: 0, taxes: 0, subsidies: 0, bonuses: 0, totalCost: 0 },
      { round: 1, teamId: "team-4", fixedCost: 700, variableCost: 1260, transportCost: 210, penalties: 0, taxes: 0, subsidies: 0, bonuses: 0, totalCost: 2170 },
      { round: 2, teamId: "team-1", fixedCost: 1900, variableCost: 2100, transportCost: 525, penalties: 0, taxes: 250, subsidies: 300, bonuses: 0, totalCost: 4475 },
      { round: 2, teamId: "team-2", fixedCost: 1200, variableCost: 1500, transportCost: 375, penalties: 0, taxes: 0, subsidies: 0, bonuses: 0, totalCost: 3075 },
      { round: 2, teamId: "team-3", fixedCost: 2500, variableCost: 3750, transportCost: 1125, penalties: 0, taxes: 0, subsidies: 0, bonuses: 200, totalCost: 7175 },
      { round: 2, teamId: "team-4", fixedCost: 700, variableCost: 1470, transportCost: 262, penalties: 0, taxes: 0, subsidies: 0, bonuses: 0, totalCost: 2432 },
      { round: 3, teamId: "team-1", fixedCost: 1900, variableCost: 1800, transportCost: 450, penalties: 0, taxes: 0, subsidies: 0, bonuses: 200, totalCost: 3950 },
      { round: 3, teamId: "team-2", fixedCost: 2900, variableCost: 2520, transportCost: 420, penalties: 0, taxes: 0, subsidies: 0, bonuses: 0, totalCost: 5840 },
      { round: 3, teamId: "team-3", fixedCost: 2500, variableCost: 3000, transportCost: 900, penalties: 400, taxes: 0, subsidies: 0, bonuses: 0, totalCost: 6800 },
      { round: 3, teamId: "team-4", fixedCost: 700, variableCost: 1680, transportCost: 280, penalties: 0, taxes: 250, subsidies: 0, bonuses: 0, totalCost: 2910 },
      { round: 4, teamId: "team-1", fixedCost: 1900, variableCost: 2400, transportCost: 600, penalties: 0, taxes: 0, subsidies: 0, bonuses: 0, totalCost: 4900 },
      { round: 4, teamId: "team-2", fixedCost: 2900, variableCost: 2730, transportCost: 455, penalties: 0, taxes: 0, subsidies: 300, bonuses: 200, totalCost: 5585 },
      { round: 4, teamId: "team-3", fixedCost: 2500, variableCost: 3375, transportCost: 1012, penalties: 0, taxes: 0, subsidies: 0, bonuses: 0, totalCost: 6887 },
      { round: 4, teamId: "team-4", fixedCost: 700, variableCost: 2100, transportCost: 350, penalties: 0, taxes: 0, subsidies: 0, bonuses: 200, totalCost: 2950 },
    ],
    transactionLogs: [],
  },
  {
    id: "history-2",
    name: "Spring 2024 - Section B",
    status: "completed",
    currentRound: 4,
    totalRounds: 4,
    currentTeamTurn: "team-1",
    createdAt: new Date("2024-03-18T14:00:00").toISOString(),
    teams: [
      { id: "team-1", name: "Team Red", color: "#22c55e", position: 10, isInJail: false, passedStart: true },
      { id: "team-2", name: "Team Blue", color: "#3b82f6", position: 6, isInJail: false, passedStart: true },
      { id: "team-3", name: "Team Orange", color: "#f97316", position: 3, isInJail: false, passedStart: true },
      { id: "team-4", name: "Team Purple", color: "#a855f7", position: 15, isInJail: false, passedStart: true },
    ],
    facilityOwnerships: [],
    allocations: [],
    appliedEvents: [],
    roundSummaries: [
      { round: 1, teamId: "team-1", fixedCost: 1200, variableCost: 1800, transportCost: 300, penalties: 0, taxes: 0, subsidies: 0, bonuses: 0, totalCost: 3300 },
      { round: 1, teamId: "team-2", fixedCost: 500, variableCost: 1500, transportCost: 250, penalties: 0, taxes: 0, subsidies: 0, bonuses: 200, totalCost: 2050 },
      { round: 1, teamId: "team-3", fixedCost: 1500, variableCost: 1540, transportCost: 275, penalties: 0, taxes: 0, subsidies: 0, bonuses: 0, totalCost: 3315 },
      { round: 1, teamId: "team-4", fixedCost: 700, variableCost: 1680, transportCost: 210, penalties: 0, taxes: 0, subsidies: 0, bonuses: 0, totalCost: 2590 },
      { round: 4, teamId: "team-1", fixedCost: 2900, variableCost: 3200, transportCost: 640, penalties: 250, taxes: 0, subsidies: 300, bonuses: 200, totalCost: 6490 },
      { round: 4, teamId: "team-2", fixedCost: 2700, variableCost: 2800, transportCost: 560, penalties: 0, taxes: 250, subsidies: 0, bonuses: 0, totalCost: 6310 },
      { round: 4, teamId: "team-3", fixedCost: 3200, variableCost: 2640, transportCost: 396, penalties: 0, taxes: 0, subsidies: 0, bonuses: 200, totalCost: 6036 },
      { round: 4, teamId: "team-4", fixedCost: 2400, variableCost: 3360, transportCost: 420, penalties: 0, taxes: 0, subsidies: 300, bonuses: 0, totalCost: 5880 },
    ],
    transactionLogs: [],
  },
  {
    id: "history-3",
    name: "Demo Session - Paused",
    status: "paused",
    currentRound: 2,
    totalRounds: 4,
    currentTeamTurn: "team-2",
    createdAt: new Date("2024-04-01T10:00:00").toISOString(),
    teams: [
      { id: "team-1", name: "Innovators", color: "#22c55e", position: 7, isInJail: false, passedStart: false },
      { id: "team-2", name: "Strategists", color: "#3b82f6", position: 4, isInJail: false, passedStart: false },
      { id: "team-3", name: "Pioneers", color: "#f97316", position: 11, isInJail: true, passedStart: false },
      { id: "team-4", name: "Trailblazers", color: "#a855f7", position: 2, isInJail: false, passedStart: false },
    ],
    facilityOwnerships: [
      { facilityId: "facility-1", ownerId: "team-1", isUpgraded: false, isFrozen: false, acquiredRound: 1 },
      { facilityId: "facility-5", ownerId: "team-4", isUpgraded: false, isFrozen: true, acquiredRound: 1 },
    ],
    allocations: [],
    appliedEvents: [],
    roundSummaries: [
      { round: 1, teamId: "team-1", fixedCost: 500, variableCost: 1500, transportCost: 250, penalties: 0, taxes: 0, subsidies: 0, bonuses: 0, totalCost: 2250 },
      { round: 1, teamId: "team-2", fixedCost: 0, variableCost: 0, transportCost: 0, penalties: 0, taxes: 0, subsidies: 0, bonuses: 0, totalCost: 0 },
      { round: 1, teamId: "team-3", fixedCost: 0, variableCost: 0, transportCost: 0, penalties: 0, taxes: 0, subsidies: 0, bonuses: 0, totalCost: 0 },
      { round: 1, teamId: "team-4", fixedCost: 700, variableCost: 1260, transportCost: 157, penalties: 0, taxes: 0, subsidies: 0, bonuses: 0, totalCost: 2117 },
    ],
    transactionLogs: [],
  },
]

function getSessionTotalCosts(session: GameSession): { teamId: string; total: number }[] {
  const totals: Record<string, number> = {}
  session.teams.forEach(t => { totals[t.id] = 0 })
  session.roundSummaries.forEach(rs => {
    totals[rs.teamId] = (totals[rs.teamId] || 0) + rs.totalCost
  })
  return Object.entries(totals)
    .map(([teamId, total]) => ({ teamId, total }))
    .sort((a, b) => a.total - b.total)
}

export default function HistoryPage() {
  const { currentSession, loadSession, deleteSession } = useGameStore()
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "paused" | "active">("all")
  const [selectedSession, setSelectedSession] = useState<GameSession | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Combine current session (if exists) with seeded history
  const allSessions = [...(currentSession ? [currentSession] : []), ...SEEDED_HISTORY]

  useEffect(() => {
    setMounted(true)
  }, [])

  const filteredSessions = allSessions.filter(session => {
    const matchesSearch = session.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || session.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleLoadSession = (session: GameSession) => {
    loadSession(session)
  }

  const handleDuplicateSession = (session: GameSession) => {
    const duplicated: GameSession = {
      ...session,
      id: `session-${Date.now()}`,
      name: `${session.name} (Copy)`,
      status: "created",
      currentRound: 1,
      createdAt: new Date().toISOString(),
    }
    loadSession(duplicated)
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <History className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Session History</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Search and Filter */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "completed", "active", "paused"] as const).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{allSessions.length}</div>
              <div className="text-sm text-muted-foreground">Total Sessions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-600">
                {allSessions.filter(s => s.status === "completed").length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-blue-600">
                {allSessions.filter(s => s.status === "active").length}
              </div>
              <div className="text-sm text-muted-foreground">Active</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-amber-600">
                {allSessions.filter(s => s.status === "paused").length}
              </div>
              <div className="text-sm text-muted-foreground">Paused</div>
            </CardContent>
          </Card>
        </div>

        {/* Sessions List */}
        <Card>
          <CardHeader>
            <CardTitle>All Sessions</CardTitle>
            <CardDescription>
              {filteredSessions.length} session{filteredSessions.length !== 1 ? "s" : ""} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {filteredSessions.map((session) => {
                  const rankings = getSessionTotalCosts(session)
                  const winner = rankings[0]
                  const winnerTeam = session.teams.find(t => t.id === winner?.teamId)

                  return (
                    <Card 
                      key={session.id} 
                      className={cn(
                        "transition-all hover:shadow-md cursor-pointer",
                        session.id === currentSession?.id && "ring-2 ring-primary"
                      )}
                      onClick={() => setSelectedSession(session)}
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">{session.name}</h3>
                              <Badge variant={
                                session.status === "completed" ? "success" :
                                session.status === "active" ? "default" :
                                session.status === "paused" ? "warning" : "secondary"
                              }>
                                {session.status}
                              </Badge>
                              {session.id === currentSession?.id && (
                                <Badge variant="outline">Current</Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-6 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(session.createdAt).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {session.teams.length} teams
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                Round {session.currentRound}/{session.totalRounds}
                              </div>
                            </div>

                            {/* Team chips */}
                            <div className="flex items-center gap-2 mt-3">
                              {session.teams.map((team) => (
                                <div
                                  key={team.id}
                                  className="flex items-center gap-1.5 px-2 py-1 bg-muted rounded-full text-xs"
                                >
                                  <div 
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: team.color }}
                                  />
                                  {team.name}
                                </div>
                              ))}
                            </div>

                            {/* Winner (if completed) */}
                            {session.status === "completed" && winnerTeam && winner.total > 0 && (
                              <div className="mt-3 flex items-center gap-2 text-sm">
                                <Trophy className="h-4 w-4 text-yellow-500" />
                                <span className="font-medium">Winner: {winnerTeam.name}</span>
                                <span className="text-muted-foreground">
                                  (${formatCurrency(winner.total)} total cost)
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}

                {filteredSessions.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    No sessions found matching your criteria
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Session Detail Dialog */}
        <Dialog open={!!selectedSession} onOpenChange={(open) => !open && setSelectedSession(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedSession && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    {selectedSession.name}
                    <Badge variant={
                      selectedSession.status === "completed" ? "success" :
                      selectedSession.status === "active" ? "default" : "warning"
                    }>
                      {selectedSession.status}
                    </Badge>
                  </DialogTitle>
                  <DialogDescription>
                    Created on {new Date(selectedSession.createdAt).toLocaleString()}
                  </DialogDescription>
                </DialogHeader>

                {/* Session Summary */}
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-muted p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold">{selectedSession.currentRound}/{selectedSession.totalRounds}</div>
                      <div className="text-xs text-muted-foreground">Rounds</div>
                    </div>
                    <div className="bg-muted p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold">{selectedSession.teams.length}</div>
                      <div className="text-xs text-muted-foreground">Teams</div>
                    </div>
                    <div className="bg-muted p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold">{selectedSession.facilityOwnerships.length}</div>
                      <div className="text-xs text-muted-foreground">Owned Facilities</div>
                    </div>
                  </div>

                  {/* Final Rankings */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        Team Rankings (Lowest Cost Wins)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">Rank</TableHead>
                            <TableHead>Team</TableHead>
                            <TableHead className="text-right">Total Cost</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getSessionTotalCosts(selectedSession).map((ranking, idx) => {
                            const team = selectedSession.teams.find(t => t.id === ranking.teamId)!
                            return (
                              <TableRow key={ranking.teamId} className={idx === 0 ? "bg-yellow-50" : ""}>
                                <TableCell className="font-bold">
                                  {idx + 1}
                                  {idx === 0 && selectedSession.status === "completed" && " 🏆"}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-4 h-4 rounded-full"
                                      style={{ backgroundColor: team.color }}
                                    />
                                    {team.name}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right font-mono">
                                  ${formatCurrency(ranking.total)}
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {/* Round by Round Summary */}
                  {selectedSession.roundSummaries.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Round Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[200px]">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Round</TableHead>
                                <TableHead>Team</TableHead>
                                <TableHead className="text-right">Fixed</TableHead>
                                <TableHead className="text-right">Variable</TableHead>
                                <TableHead className="text-right">Transport</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedSession.roundSummaries.map((summary, idx) => {
                                const team = selectedSession.teams.find(t => t.id === summary.teamId)
                                return (
                                  <TableRow key={`${summary.round}-${summary.teamId}`}>
                                    <TableCell>{summary.round}</TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <div 
                                          className="w-3 h-3 rounded-full"
                                          style={{ backgroundColor: team?.color }}
                                        />
                                        {team?.name}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-sm">
                                      ${formatCurrency(summary.fixedCost)}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-sm">
                                      ${formatCurrency(summary.variableCost)}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-sm">
                                      ${formatCurrency(summary.transportCost)}
                                    </TableCell>
                                    <TableCell className="text-right font-mono font-semibold">
                                      ${formatCurrency(summary.totalCost)}
                                    </TableCell>
                                  </TableRow>
                                )
                              })}
                            </TableBody>
                          </Table>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <DialogFooter className="mt-6 flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      handleDuplicateSession(selectedSession)
                      setSelectedSession(null)
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </Button>
                  {selectedSession.status !== "completed" && (
                    <Link href="/admin">
                      <Button onClick={() => {
                        handleLoadSession(selectedSession)
                        setSelectedSession(null)
                      }}>
                        <Play className="h-4 w-4 mr-2" />
                        Continue Session
                      </Button>
                    </Link>
                  )}
                  {selectedSession.status === "completed" && (
                    <Link href="/viewer">
                      <Button onClick={() => {
                        handleLoadSession(selectedSession)
                        setSelectedSession(null)
                      }}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Results
                      </Button>
                    </Link>
                  )}
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
