"use client"

import { useState } from "react"
import type { GameSession, TeamId, ZoneId } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useGameStore } from "@/lib/game-store"
import { FACILITIES, OPPORTUNITY_CARDS, RISK_CARDS, BOARD_CELLS, getFacilityById } from "@/lib/game-data"
import { validateRoundAllocations, calculateIncomeTax } from "@/lib/calculations"
import { cn, formatCurrency, getTeamColorClass } from "@/lib/utils"
import {
  Dice5,
  ShoppingCart,
  ArrowUp,
  Snowflake,
  Lock,
  Unlock,
  Receipt,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  Play,
  Pause,
  CheckCircle,
} from "lucide-react"

interface AdminActionsPanelProps {
  session: GameSession
}

export function AdminActionsPanel({ session }: AdminActionsPanelProps) {
  const {
    moveTeam,
    purchaseFacility,
    upgradeFacility,
    freezeFacility,
    unfreezeFacility,
    sendToJail,
    releaseFromJail,
    applyEvent,
    applyTax,
    applyServiceFee,
    closeRound,
    nextTurn,
    startSession,
    pauseSession,
    resumeSession,
  } = useGameStore()

  const [diceRoll, setDiceRoll] = useState("")
  const [selectedTeamForMove, setSelectedTeamForMove] = useState<TeamId | "">(
    session.currentTeamTurn
  )
  const [selectedFacilityForAction, setSelectedFacilityForAction] = useState<number | "">("")
  const [selectedEventCard, setSelectedEventCard] = useState("")
  const [eventTargetFacility, setEventTargetFacility] = useState<number | "">("")
  const [eventTargetZone, setEventTargetZone] = useState<ZoneId | "">("")
  const [freezeRounds, setFreezeRounds] = useState("1")
  const [closeRoundErrors, setCloseRoundErrors] = useState<string[]>([])
  const [showCloseRoundDialog, setShowCloseRoundDialog] = useState(false)

  const currentTeam = session.teams.find((t) => t.id === session.currentTeamTurn)
  const currentCell = BOARD_CELLS[currentTeam?.position || 0]

  // Get purchasable facilities (unowned, on current cell)
  const purchasableFacility =
    currentCell.type === "facility" && currentCell.facilityId
      ? session.facilityOwnerships.find(
          (o) => o.facilityId === currentCell.facilityId && o.ownerId === null
        )
      : null

  // Get upgradable facilities (owned by current team, not yet upgraded)
  const upgradableFacilities = session.facilityOwnerships.filter(
    (o) =>
      o.ownerId === session.currentTeamTurn && !o.isUpgraded
  )

  // Handle dice roll and move
  const handleMove = () => {
    if (!diceRoll || !selectedTeamForMove) return
    const roll = parseInt(diceRoll)
    if (isNaN(roll) || roll < 1) return
    moveTeam(selectedTeamForMove, roll)
    setDiceRoll("")
  }

  // Handle purchase
  const handlePurchase = () => {
    if (!purchasableFacility) return
    purchaseFacility(session.currentTeamTurn, purchasableFacility.facilityId)
  }

  // Handle upgrade
  const handleUpgrade = () => {
    if (!selectedFacilityForAction) return
    upgradeFacility(session.currentTeamTurn, selectedFacilityForAction as number)
    setSelectedFacilityForAction("")
  }

  // Handle freeze
  const handleFreeze = () => {
    if (!selectedFacilityForAction) return
    freezeFacility(selectedFacilityForAction as number, parseInt(freezeRounds) || 1)
    setSelectedFacilityForAction("")
  }

  // Handle apply event
  const handleApplyEvent = () => {
    if (!selectedEventCard) return
    applyEvent(
      selectedEventCard,
      session.currentTeamTurn,
      eventTargetFacility || undefined,
      eventTargetZone || undefined
    )
    setSelectedEventCard("")
    setEventTargetFacility("")
    setEventTargetZone("")
  }

  // Handle close round
  const handleCloseRound = () => {
    const validation = validateRoundAllocations(session, session.currentRound)
    if (!validation.isValid) {
      setCloseRoundErrors(validation.errors.map((e) => e.message))
      setShowCloseRoundDialog(true)
      return
    }

    const result = closeRound()
    if (!result.success && result.errors) {
      setCloseRoundErrors(result.errors)
      setShowCloseRoundDialog(true)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Admin Actions</CardTitle>
          <div className="flex items-center gap-2">
            {session.status === "setup" && (
              <Button size="sm" onClick={() => startSession()}>
                <Play className="h-4 w-4 mr-1" />
                Start Game
              </Button>
            )}
            {session.status === "active" && (
              <Button size="sm" variant="outline" onClick={() => pauseSession()}>
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </Button>
            )}
            {session.status === "paused" && (
              <Button size="sm" onClick={() => resumeSession()}>
                <Play className="h-4 w-4 mr-1" />
                Resume
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current turn indicator */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-4 h-4 rounded-full",
                getTeamColorClass(session.currentTeamTurn)
              )}
            />
            <span className="font-medium">{currentTeam?.name}&apos;s Turn</span>
          </div>
          <Badge variant="outline">
            Round {session.currentRound}/{session.totalRounds}
          </Badge>
        </div>

        <Tabs defaultValue="movement" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="movement">Move</TabsTrigger>
            <TabsTrigger value="facilities">Facilities</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="round">Round</TabsTrigger>
          </TabsList>

          {/* Movement Tab */}
          <TabsContent value="movement" className="space-y-3 mt-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Team</Label>
                <Select
                  value={selectedTeamForMove?.toString() || ""}
                  onValueChange={(v) => setSelectedTeamForMove(parseInt(v) as TeamId)}
                >
                  <SelectTrigger>
                    <SelectValue />
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
                <Label className="text-xs">Dice Roll</Label>
                <Input
                  type="number"
                  min={1}
                  max={12}
                  value={diceRoll}
                  onChange={(e) => setDiceRoll(e.target.value)}
                  placeholder="1-12"
                />
              </div>
            </div>
            <Button onClick={handleMove} className="w-full" disabled={!diceRoll}>
              <Dice5 className="h-4 w-4 mr-2" />
              Move Team
            </Button>

            {/* Current cell info */}
            {currentTeam && (
              <div className="p-2 bg-muted/50 rounded text-sm">
                <span className="text-muted-foreground">Current cell: </span>
                <span className="font-medium">{currentCell.name}</span>
                {currentCell.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {currentCell.description}
                  </p>
                )}
              </div>
            )}

            {/* Jail actions */}
            {currentTeam?.isInJail && (
              <div className="space-y-2">
                <p className="text-sm text-amber-600 flex items-center gap-1">
                  <Lock className="h-4 w-4" />
                  {currentTeam.name} is in Legal Hold
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => releaseFromJail(session.currentTeamTurn, true)}
                  >
                    Release (Pay $300)
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => releaseFromJail(session.currentTeamTurn, false)}
                  >
                    Release Free
                  </Button>
                </div>
              </div>
            )}

            <Button
              variant="outline"
              onClick={() => sendToJail(session.currentTeamTurn)}
              className="w-full"
            >
              <Lock className="h-4 w-4 mr-2" />
              Send to Legal Hold
            </Button>

            <Button variant="secondary" onClick={() => nextTurn()} className="w-full">
              <ChevronRight className="h-4 w-4 mr-2" />
              Next Turn
            </Button>
          </TabsContent>

          {/* Facilities Tab */}
          <TabsContent value="facilities" className="space-y-3 mt-3">
            {/* Purchase */}
            {purchasableFacility && (
              <div className="space-y-2">
                <Label className="text-xs">Purchase Available</Label>
                <Button onClick={handlePurchase} className="w-full">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Buy {getFacilityById(purchasableFacility.facilityId)?.name} ($
                  {formatCurrency(
                    getFacilityById(purchasableFacility.facilityId)?.purchasePrice || 0
                  )}
                  )
                </Button>
              </div>
            )}

            {/* Upgrade */}
            <div className="space-y-2">
              <Label className="text-xs">Upgrade Facility</Label>
              <Select
                value={selectedFacilityForAction?.toString() || ""}
                onValueChange={(v) => setSelectedFacilityForAction(parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select facility" />
                </SelectTrigger>
                <SelectContent>
                  {upgradableFacilities.map((o) => {
                    const facility = getFacilityById(o.facilityId)
                    return (
                      <SelectItem key={o.facilityId} value={o.facilityId.toString()}>
                        {facility?.name} (${formatCurrency(facility?.upgradeCost || 0)})
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              <Button
                onClick={handleUpgrade}
                disabled={!selectedFacilityForAction || upgradableFacilities.length === 0}
                className="w-full"
              >
                <ArrowUp className="h-4 w-4 mr-2" />
                Apply Upgrade
              </Button>
            </div>

            {/* Freeze/Unfreeze */}
            <div className="space-y-2">
              <Label className="text-xs">Freeze Facility</Label>
              <div className="flex gap-2">
                <Select
                  value={selectedFacilityForAction?.toString() || ""}
                  onValueChange={(v) => setSelectedFacilityForAction(parseInt(v))}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select facility" />
                  </SelectTrigger>
                  <SelectContent>
                    {FACILITIES.map((f) => (
                      <SelectItem key={f.id} value={f.id.toString()}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min={1}
                  max={4}
                  value={freezeRounds}
                  onChange={(e) => setFreezeRounds(e.target.value)}
                  className="w-16"
                  placeholder="Rounds"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={handleFreeze}
                  disabled={!selectedFacilityForAction}
                  className="flex-1"
                >
                  <Snowflake className="h-4 w-4 mr-2" />
                  Freeze
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (selectedFacilityForAction) {
                      unfreezeFacility(selectedFacilityForAction as number)
                      setSelectedFacilityForAction("")
                    }
                  }}
                  disabled={!selectedFacilityForAction}
                  className="flex-1"
                >
                  <Unlock className="h-4 w-4 mr-2" />
                  Unfreeze
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-3 mt-3">
            <div className="space-y-2">
              <Label className="text-xs">Event Card</Label>
              <Select
                value={selectedEventCard}
                onValueChange={setSelectedEventCard}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event card" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="header-opp" disabled>
                    -- Opportunity Cards --
                  </SelectItem>
                  {OPPORTUNITY_CARDS.map((card) => (
                    <SelectItem key={card.id} value={card.id}>
                      {card.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="header-risk" disabled>
                    -- Risk Cards --
                  </SelectItem>
                  {RISK_CARDS.map((card) => (
                    <SelectItem key={card.id} value={card.id}>
                      {card.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedEventCard && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Target Facility (optional)</Label>
                    <Select
                      value={eventTargetFacility?.toString() || ""}
                      onValueChange={(v) => setEventTargetFacility(parseInt(v))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {FACILITIES.map((f) => (
                          <SelectItem key={f.id} value={f.id.toString()}>
                            {f.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Target Zone (optional)</Label>
                    <Select
                      value={eventTargetZone}
                      onValueChange={(v) => setEventTargetZone(v as ZoneId)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {(["A", "B", "C", "D"] as ZoneId[]).map((z) => (
                          <SelectItem key={z} value={z}>
                            Zone {z}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleApplyEvent} className="w-full">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Apply Event
                </Button>
              </>
            )}

            {/* Tax actions */}
            <div className="space-y-2 pt-2 border-t">
              <Label className="text-xs">Tax Actions</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applyTax(session.currentTeamTurn, "income")}
                  className="flex-1"
                >
                  <Receipt className="h-4 w-4 mr-1" />
                  Income Tax ($
                  {formatCurrency(
                    calculateIncomeTax(session, session.currentTeamTurn, session.currentRound)
                  )}
                  )
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applyTax(session.currentTeamTurn, "luxury")}
                  className="flex-1"
                >
                  Luxury Tax (${formatCurrency(session.taxConfig.luxuryTaxAmount)})
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Round Tab */}
          <TabsContent value="round" className="space-y-3 mt-3">
            <div className="p-3 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current Round:</span>
                <span className="font-medium">
                  {session.currentRound} of {session.totalRounds}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Status:</span>
                <Badge
                  variant={
                    session.status === "active"
                      ? "success"
                      : session.status === "completed"
                        ? "default"
                        : "secondary"
                  }
                >
                  {session.status}
                </Badge>
              </div>
            </div>

            <Dialog open={showCloseRoundDialog} onOpenChange={setShowCloseRoundDialog}>
              <DialogTrigger asChild>
                <Button
                  className="w-full"
                  disabled={session.status !== "active"}
                  onClick={() => {
                    const validation = validateRoundAllocations(
                      session,
                      session.currentRound
                    )
                    if (validation.isValid) {
                      handleCloseRound()
                    } else {
                      setCloseRoundErrors(validation.errors.map((e) => e.message))
                      setShowCloseRoundDialog(true)
                    }
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Close Round {session.currentRound}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Cannot Close Round
                  </DialogTitle>
                  <DialogDescription>
                    The following issues must be resolved before closing this round:
                  </DialogDescription>
                </DialogHeader>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {closeRoundErrors.map((error, idx) => (
                    <li key={idx} className="text-destructive">
                      {error}
                    </li>
                  ))}
                </ul>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowCloseRoundDialog(false)}
                  >
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {session.currentRound >= session.totalRounds && (
              <p className="text-sm text-muted-foreground text-center">
                This is the final round.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
