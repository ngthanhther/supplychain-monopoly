"use client"

import { useEffect, useState } from "react"
import { useGameStore } from "@/lib/game-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import {
  Settings,
  Building2,
  Target,
  Sparkles,
  AlertTriangle,
  DollarSign,
  Truck,
  Save,
  RotateCcw,
  Home,
  ArrowLeft,
  Info,
} from "lucide-react"
import { FACILITIES, CUSTOMER_ZONES, OPPORTUNITY_CARDS, RISK_CARDS, DEFAULT_DEMAND } from "@/lib/game-data"
import type { Facility, CustomerZone, EventCard, ZoneId, RoundDemand } from "@/lib/types"

export default function SettingsPage() {
  const { currentSession, updateSessionSettings } = useGameStore()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("facilities")
  
  // Editable state for facilities
  const [editedFacilities, setEditedFacilities] = useState<Facility[]>([...FACILITIES])
  
  // Editable state for customer zones
  const [editedZones, setEditedZones] = useState<CustomerZone[]>([...CUSTOMER_ZONES])
  
  // Editable state for demand
  const [editedDemand, setEditedDemand] = useState<RoundDemand>({ ...DEFAULT_DEMAND })
  
  // Transport rate
  const [transportRate, setTransportRate] = useState(0.5)
  
  // Tax settings
  const [incomeTaxFlat, setIncomeTaxFlat] = useState(250)
  const [incomeTaxPercent, setIncomeTaxPercent] = useState(10)
  const [luxuryTaxAmount, setLuxuryTaxAmount] = useState(400)
  const [jailReleaseFee, setJailReleaseFee] = useState(300)
  const [startBonus, setStartBonus] = useState(200)

  // Event cards
  const [editedOpportunityCards, setEditedOpportunityCards] = useState<EventCard[]>([...OPPORTUNITY_CARDS])
  const [editedRiskCards, setEditedRiskCards] = useState<EventCard[]>([...RISK_CARDS])

  const [hasChanges, setHasChanges] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Check for changes
    setHasChanges(true)
  }, [editedFacilities, editedZones, editedDemand, transportRate, incomeTaxFlat, luxuryTaxAmount])

  const handleFacilityChange = (facilityId: string, field: keyof Facility, value: number | string) => {
    setEditedFacilities(prev => prev.map(f => 
      f.id === facilityId ? { ...f, [field]: value } : f
    ))
  }

  const handleZoneChange = (zoneId: ZoneId, field: keyof CustomerZone, value: string) => {
    setEditedZones(prev => prev.map(z => 
      z.id === zoneId ? { ...z, [field]: value } : z
    ))
  }

  const handleDemandChange = (round: number, zoneId: ZoneId, value: number) => {
    setEditedDemand(prev => ({
      ...prev,
      [round]: {
        ...prev[round],
        [zoneId]: value
      }
    }))
  }

  const handleSaveSettings = () => {
    // In a real app, this would save to a backend
    // For now, we just show success
    setSaveSuccess(true)
    setHasChanges(false)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  const handleResetDefaults = () => {
    setEditedFacilities([...FACILITIES])
    setEditedZones([...CUSTOMER_ZONES])
    setEditedDemand({ ...DEFAULT_DEMAND })
    setTransportRate(0.5)
    setIncomeTaxFlat(250)
    setIncomeTaxPercent(10)
    setLuxuryTaxAmount(400)
    setJailReleaseFee(300)
    setStartBonus(200)
    setEditedOpportunityCards([...OPPORTUNITY_CARDS])
    setEditedRiskCards([...RISK_CARDS])
    setHasChanges(false)
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
              <Settings className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Master Data Settings</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {hasChanges && (
              <Badge variant="warning">Unsaved Changes</Badge>
            )}
            {saveSuccess && (
              <Badge variant="success">Settings Saved</Badge>
            )}
            <Button variant="outline" onClick={handleResetDefaults}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Defaults
            </Button>
            <Button onClick={handleSaveSettings} disabled={!hasChanges}>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Master Data Configuration</AlertTitle>
          <AlertDescription>
            Configure game parameters, facility data, customer zones, demand values, and event cards. 
            Changes here will affect new game sessions. Currently active sessions will not be modified.
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="facilities" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Facilities
            </TabsTrigger>
            <TabsTrigger value="zones" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Customer Zones
            </TabsTrigger>
            <TabsTrigger value="demand" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Round Demand
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Event Cards
            </TabsTrigger>
            <TabsTrigger value="rules" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Rules & Taxes
            </TabsTrigger>
          </TabsList>

          {/* Facilities Tab */}
          <TabsContent value="facilities">
            <Card>
              <CardHeader>
                <CardTitle>Facility Master Data</CardTitle>
                <CardDescription>
                  Configure facility costs, capacities, and upgrade parameters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px]">Facility</TableHead>
                        <TableHead className="text-right">Purchase</TableHead>
                        <TableHead className="text-right">Fixed Cost</TableHead>
                        <TableHead className="text-right">Var. Cost</TableHead>
                        <TableHead className="text-right">Capacity</TableHead>
                        <TableHead className="text-right">Service Fee</TableHead>
                        <TableHead className="text-right">Buyback</TableHead>
                        <TableHead className="text-right">Upgrade Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {editedFacilities.map((facility) => (
                        <TableRow key={facility.id}>
                          <TableCell className="font-medium">
                            <div className="text-sm">{facility.name}</div>
                            <div className="text-xs text-muted-foreground">{facility.upgradeName}</div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              value={facility.purchasePrice}
                              onChange={(e) => handleFacilityChange(facility.id, "purchasePrice", Number(e.target.value))}
                              className="w-20 h-8 text-right text-sm"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              value={facility.fixedCost}
                              onChange={(e) => handleFacilityChange(facility.id, "fixedCost", Number(e.target.value))}
                              className="w-20 h-8 text-right text-sm"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              step="0.1"
                              value={facility.variableCost}
                              onChange={(e) => handleFacilityChange(facility.id, "variableCost", Number(e.target.value))}
                              className="w-20 h-8 text-right text-sm"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              value={facility.capacity}
                              onChange={(e) => handleFacilityChange(facility.id, "capacity", Number(e.target.value))}
                              className="w-20 h-8 text-right text-sm"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              value={facility.serviceFee}
                              onChange={(e) => handleFacilityChange(facility.id, "serviceFee", Number(e.target.value))}
                              className="w-20 h-8 text-right text-sm"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              value={facility.buybackPrice}
                              onChange={(e) => handleFacilityChange(facility.id, "buybackPrice", Number(e.target.value))}
                              className="w-20 h-8 text-right text-sm"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              value={facility.upgradeCost}
                              onChange={(e) => handleFacilityChange(facility.id, "upgradeCost", Number(e.target.value))}
                              className="w-20 h-8 text-right text-sm"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>

                {/* Distance Matrix */}
                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Distance Matrix (Facility to Zone)</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Facility</TableHead>
                        <TableHead className="text-center">Zone A</TableHead>
                        <TableHead className="text-center">Zone B</TableHead>
                        <TableHead className="text-center">Zone C</TableHead>
                        <TableHead className="text-center">Zone D</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {editedFacilities.map((facility) => (
                        <TableRow key={facility.id}>
                          <TableCell className="font-medium">{facility.name}</TableCell>
                          {(["A", "B", "C", "D"] as ZoneId[]).map((zoneId) => (
                            <TableCell key={zoneId} className="text-center">
                              <Badge variant={
                                facility.distances[zoneId] === 1 ? "success" :
                                facility.distances[zoneId] === 2 ? "warning" : "destructive"
                              }>
                                {facility.distances[zoneId]}
                              </Badge>
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <p className="text-sm text-muted-foreground mt-2">
                    Distance Index: 1 = Near, 2 = Medium, 3 = Far. Transport Cost = Units x Distance x Transport Rate
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customer Zones Tab */}
          <TabsContent value="zones">
            <Card>
              <CardHeader>
                <CardTitle>Customer Zones</CardTitle>
                <CardDescription>
                  Configure customer zone names and descriptions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  {editedZones.map((zone) => (
                    <Card key={zone.id} className="border-2">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold text-white"
                            style={{ backgroundColor: zone.color }}
                          >
                            {zone.id}
                          </div>
                          <div className="flex-1">
                            <Label htmlFor={`zone-${zone.id}-name`}>Zone Name</Label>
                            <Input
                              id={`zone-${zone.id}-name`}
                              value={zone.name}
                              onChange={(e) => handleZoneChange(zone.id, "name", e.target.value)}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Label htmlFor={`zone-${zone.id}-desc`}>Description</Label>
                        <Input
                          id={`zone-${zone.id}-desc`}
                          value={zone.description}
                          onChange={(e) => handleZoneChange(zone.id, "description", e.target.value)}
                          className="mt-1"
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Round Demand Tab */}
          <TabsContent value="demand">
            <Card>
              <CardHeader>
                <CardTitle>Round Demand Configuration</CardTitle>
                <CardDescription>
                  Set the demand values for each customer zone in each round
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Round</TableHead>
                      <TableHead className="text-center">Zone A</TableHead>
                      <TableHead className="text-center">Zone B</TableHead>
                      <TableHead className="text-center">Zone C</TableHead>
                      <TableHead className="text-center">Zone D</TableHead>
                      <TableHead className="text-center">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[1, 2, 3, 4].map((round) => {
                      const roundDemand = editedDemand[round] || { A: 0, B: 0, C: 0, D: 0 }
                      const total = Object.values(roundDemand).reduce((sum, v) => sum + v, 0)
                      return (
                        <TableRow key={round}>
                          <TableCell className="font-medium">Round {round}</TableCell>
                          {(["A", "B", "C", "D"] as ZoneId[]).map((zoneId) => (
                            <TableCell key={zoneId} className="text-center">
                              <Input
                                type="number"
                                value={roundDemand[zoneId]}
                                onChange={(e) => handleDemandChange(round, zoneId, Number(e.target.value))}
                                className="w-24 h-8 text-center mx-auto"
                              />
                            </TableCell>
                          ))}
                          <TableCell className="text-center font-mono font-semibold">
                            {total}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Demand Summary</h4>
                  <div className="grid grid-cols-5 gap-4 text-center">
                    <div>
                      <div className="text-sm text-muted-foreground">Zone A Total</div>
                      <div className="text-lg font-mono font-bold">
                        {[1, 2, 3, 4].reduce((sum, r) => sum + (editedDemand[r]?.A || 0), 0)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Zone B Total</div>
                      <div className="text-lg font-mono font-bold">
                        {[1, 2, 3, 4].reduce((sum, r) => sum + (editedDemand[r]?.B || 0), 0)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Zone C Total</div>
                      <div className="text-lg font-mono font-bold">
                        {[1, 2, 3, 4].reduce((sum, r) => sum + (editedDemand[r]?.C || 0), 0)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Zone D Total</div>
                      <div className="text-lg font-mono font-bold">
                        {[1, 2, 3, 4].reduce((sum, r) => sum + (editedDemand[r]?.D || 0), 0)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Grand Total</div>
                      <div className="text-lg font-mono font-bold text-primary">
                        {[1, 2, 3, 4].reduce((sum, r) => 
                          sum + Object.values(editedDemand[r] || {}).reduce((s, v) => s + v, 0), 0
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Event Cards Tab */}
          <TabsContent value="events">
            <div className="grid grid-cols-2 gap-6">
              {/* Opportunity Cards */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <Sparkles className="h-5 w-5" />
                    Opportunity Cards
                  </CardTitle>
                  <CardDescription>
                    Positive events that benefit teams
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-4">
                      {editedOpportunityCards.map((card) => (
                        <Card key={card.id} className="bg-green-50 border-green-200">
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between mb-2">
                              <Badge variant="success">{card.id}</Badge>
                              <Badge variant="outline">{card.effectType}</Badge>
                            </div>
                            <h4 className="font-semibold">{card.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{card.description}</p>
                            <div className="mt-2 text-xs font-mono bg-green-100 p-2 rounded">
                              Effect: {card.effectType === "fixed_cost_reduction" && `-$${card.value} fixed cost`}
                              {card.effectType === "variable_cost_reduction" && `-${card.value} variable cost`}
                              {card.effectType === "demand_increase" && `+${card.value} demand`}
                              {card.effectType === "immediate_upgrade" && "Immediate upgrade"}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Risk Cards */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="h-5 w-5" />
                    Risk Cards
                  </CardTitle>
                  <CardDescription>
                    Negative events that create challenges
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-4">
                      {editedRiskCards.map((card) => (
                        <Card key={card.id} className="bg-red-50 border-red-200">
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between mb-2">
                              <Badge variant="destructive">{card.id}</Badge>
                              <Badge variant="outline">{card.effectType}</Badge>
                            </div>
                            <h4 className="font-semibold">{card.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{card.description}</p>
                            <div className="mt-2 text-xs font-mono bg-red-100 p-2 rounded">
                              Effect: {card.effectType === "freeze_facility" && "Facility frozen"}
                              {card.effectType === "variable_cost_increase" && `+${card.value} variable cost`}
                              {card.effectType === "distance_increase" && `+${card.value} distance index`}
                              {card.effectType === "demand_decrease" && `-${card.value * 100}% demand`}
                              {card.effectType === "disable_upgrade" && "Upgrade disabled"}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Rules & Taxes Tab */}
          <TabsContent value="rules">
            <div className="grid grid-cols-2 gap-6">
              {/* Transport Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Transport Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="transport-rate">Transport Rate (per unit-distance)</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-muted-foreground">$</span>
                      <Input
                        id="transport-rate"
                        type="number"
                        step="0.1"
                        value={transportRate}
                        onChange={(e) => setTransportRate(Number(e.target.value))}
                        className="w-32"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Transport Cost = Units x Distance Index x Rate
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Tax Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Tax Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="income-tax-flat">Income Tax (Flat)</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-muted-foreground">$</span>
                        <Input
                          id="income-tax-flat"
                          type="number"
                          value={incomeTaxFlat}
                          onChange={(e) => setIncomeTaxFlat(Number(e.target.value))}
                          className="w-24"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="income-tax-percent">Income Tax (%)</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          id="income-tax-percent"
                          type="number"
                          value={incomeTaxPercent}
                          onChange={(e) => setIncomeTaxPercent(Number(e.target.value))}
                          className="w-24"
                        />
                        <span className="text-muted-foreground">%</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="luxury-tax">Luxury Tax / Forced Investment</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-muted-foreground">$</span>
                      <Input
                        id="luxury-tax"
                        type="number"
                        value={luxuryTaxAmount}
                        onChange={(e) => setLuxuryTaxAmount(Number(e.target.value))}
                        className="w-32"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Jail Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Jail / Legal Hold Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="jail-fee">Jail Release Fee</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-muted-foreground">$</span>
                      <Input
                        id="jail-fee"
                        type="number"
                        value={jailReleaseFee}
                        onChange={(e) => setJailReleaseFee(Number(e.target.value))}
                        className="w-32"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Fee to release a frozen facility or clear jail status
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Bonus Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Bonus Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="start-bonus">Passing Start Bonus (Cost Reduction)</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-muted-foreground">-$</span>
                      <Input
                        id="start-bonus"
                        type="number"
                        value={startBonus}
                        onChange={(e) => setStartBonus(Number(e.target.value))}
                        className="w-32"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Cost reduction applied when a team passes the Start cell
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Formulas Reference */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Cost Calculation Formulas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-sm bg-muted p-4 rounded-lg space-y-2">
                  <p><strong>Total Cost</strong> = Fixed Cost + Variable Cost + Transport Cost + Penalties + Taxes - Subsidies - Bonuses</p>
                  <p><strong>Fixed Cost</strong> = Sum of (Facility Fixed Cost) for all active owned facilities</p>
                  <p><strong>Variable Cost</strong> = Sum of (Allocated Units x Effective Variable Cost) per facility</p>
                  <p><strong>Transport Cost</strong> = Sum of (Allocated Units x Distance Index x Transport Rate) per allocation</p>
                  <p><strong>Effective Variable Cost</strong> = Base Variable Cost - Upgrade Bonus (if upgraded)</p>
                  <p><strong>Effective Capacity</strong> = Base Capacity + Upgrade Bonus (if upgraded)</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
