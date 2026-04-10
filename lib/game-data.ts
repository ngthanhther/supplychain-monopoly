// ============================================
// SUPPLY CHAIN MONOPOLY - MASTER DATA & SEEDS
// ============================================

import type {
  Facility,
  BoardCell,
  CustomerZone,
  RoundDemand,
  EventCard,
  Team,
  TeamId,
  FacilityOwnership,
  TaxConfig,
  GameSession,
} from "./types"

// ============================================
// CUSTOMER ZONES
// ============================================
export const CUSTOMER_ZONES: CustomerZone[] = [
  { id: "A", name: "Urban Retail Cluster", description: "High-density urban retail area with consistent demand" },
  { id: "B", name: "Industrial Park", description: "Manufacturing hub with bulk order requirements" },
  { id: "C", name: "Port / Export Hub", description: "International shipping gateway with variable demand" },
  { id: "D", name: "Rural Distribution Area", description: "Low-density region with dispersed delivery points" },
]

// ============================================
// FACILITIES - Master Data
// ============================================
export const FACILITIES: Facility[] = [
  {
    id: 1,
    name: "City Micro Hub",
    cellIndex: 1,
    purchasePrice: 500,
    fixedCost: 500,
    variableCost: 5.0,
    capacity: 600,
    serviceFee: 300,
    buybackPrice: 700,
    upgradeName: "Extra Racking",
    upgradeCost: 300,
    upgradeCapacityBonus: 300,
    distances: { A: 1, B: 2, C: 3, D: 3 },
  },
  {
    id: 2,
    name: "Regional Warehouse North",
    cellIndex: 3,
    purchasePrice: 1200,
    fixedCost: 1200,
    variableCost: 3.0,
    capacity: 1200,
    serviceFee: 500,
    buybackPrice: 1500,
    upgradeName: "Process Automation",
    upgradeCost: 400,
    upgradeVariableCostDelta: -0.5,
    distances: { A: 2, B: 1, C: 2, D: 3 },
  },
  {
    id: 3,
    name: "Port Distribution Hub",
    cellIndex: 5,
    purchasePrice: 1500,
    fixedCost: 1400,
    variableCost: 2.8,
    capacity: 1100,
    serviceFee: 550,
    buybackPrice: 1800,
    upgradeName: "Dock Expansion",
    upgradeCost: 350,
    upgradeCapacityBonus: 400,
    distances: { A: 2, B: 2, C: 1, D: 3 },
  },
  {
    id: 4,
    name: "Mega DC Central",
    cellIndex: 8,
    purchasePrice: 2500,
    fixedCost: 2500,
    variableCost: 1.5,
    capacity: 2500,
    serviceFee: 800,
    buybackPrice: 3000,
    upgradeName: "High-Speed Automation",
    upgradeCost: 600,
    upgradeCapacityBonus: 1000,
    distances: { A: 2, B: 2, C: 2, D: 2 },
  },
  {
    id: 5,
    name: "Rural Cross-Dock",
    cellIndex: 11,
    purchasePrice: 700,
    fixedCost: 700,
    variableCost: 4.2,
    capacity: 700,
    serviceFee: 350,
    buybackPrice: 900,
    upgradeName: "Loading Bay Extension",
    upgradeCost: 250,
    upgradeCapacityBonus: 200,
    distances: { A: 3, B: 2, C: 3, D: 1 },
  },
  {
    id: 6,
    name: "Industrial Flex Plant",
    cellIndex: 13,
    purchasePrice: 1800,
    fixedCost: 1700,
    variableCost: 2.2,
    capacity: 1400,
    serviceFee: 650,
    buybackPrice: 2100,
    upgradeName: "Flexible Line Upgrade",
    upgradeCost: 500,
    upgradeVariableCostDelta: -0.4,
    distances: { A: 2, B: 1, C: 2, D: 2 },
  },
]

// ============================================
// BOARD CELLS - 16 cells around the perimeter
// ============================================
export const BOARD_CELLS: BoardCell[] = [
  { index: 0, type: "start", name: "START", description: "Pass to receive stability bonus (-200 cost)" },
  { index: 1, type: "facility", name: "City Micro Hub", facilityId: 1 },
  { index: 2, type: "opportunity", name: "Opportunity", description: "Draw an opportunity card" },
  { index: 3, type: "facility", name: "Regional Warehouse North", facilityId: 2 },
  { index: 4, type: "income-tax", name: "Income Tax", description: "Pay 10% of fixed costs or flat 250" },
  { index: 5, type: "facility", name: "Port Distribution Hub", facilityId: 3 },
  { index: 6, type: "market-review", name: "Market Review", description: "Review demand forecasts" },
  { index: 7, type: "risk", name: "Risk", description: "Draw a risk card" },
  { index: 8, type: "facility", name: "Mega DC Central", facilityId: 4 },
  { index: 9, type: "jail", name: "Legal Hold", description: "Facility frozen or pay 300 to release" },
  { index: 10, type: "negotiation", name: "Negotiation Window", description: "Negotiate facility access" },
  { index: 11, type: "facility", name: "Rural Cross-Dock", facilityId: 5 },
  { index: 12, type: "free-parking", name: "Idle Capacity Trap", description: "Skip strategic action" },
  { index: 13, type: "facility", name: "Industrial Flex Plant", facilityId: 6 },
  { index: 14, type: "luxury-tax", name: "Forced Investment", description: "Pay 400 or upgrade a facility" },
  { index: 15, type: "risk", name: "Risk", description: "Draw a risk card" },
]

// ============================================
// DEFAULT ROUND DEMANDS
// ============================================
export const DEFAULT_ROUND_DEMANDS: RoundDemand[] = [
  { round: 1, demands: { A: 500, B: 600, C: 400, D: 300 } },
  { round: 2, demands: { A: 700, B: 500, C: 600, D: 350 } },
  { round: 3, demands: { A: 450, B: 750, C: 500, D: 400 } },
  { round: 4, demands: { A: 650, B: 650, C: 550, D: 500 } },
]

// ============================================
// EVENT CARDS
// ============================================
export const OPPORTUNITY_CARDS: EventCard[] = [
  {
    id: "opp-1",
    type: "opportunity",
    name: "Government Subsidy",
    description: "Reduce total fixed cost by 300 this round",
    effect: { type: "reduce-fixed-cost", amount: 300 },
  },
  {
    id: "opp-2",
    type: "opportunity",
    name: "Automation Support",
    description: "Reduce one facility's variable cost by 0.5 this round",
    effect: { type: "reduce-variable-cost", facilityId: "any", amount: 0.5 },
  },
  {
    id: "opp-3",
    type: "opportunity",
    name: "Strong Contract",
    description: "One customer zone demand increases by 200 units",
    effect: { type: "increase-demand", zoneId: "any", amount: 200 },
  },
  {
    id: "opp-4",
    type: "opportunity",
    name: "Fast Permit Approval",
    description: "One facility upgrade can be applied immediately at no cost",
    effect: { type: "immediate-upgrade", facilityId: "any" },
  },
]

export const RISK_CARDS: EventCard[] = [
  {
    id: "risk-1",
    type: "risk",
    name: "Labor Strike",
    description: "One selected facility is frozen this round",
    effect: { type: "freeze-facility", facilityId: "any", rounds: 1 },
  },
  {
    id: "risk-2",
    type: "risk",
    name: "Utility Spike",
    description: "Variable cost +0.7 for one facility this round",
    effect: { type: "increase-variable-cost", facilityId: "any", amount: 0.7 },
  },
  {
    id: "risk-3",
    type: "risk",
    name: "Transport Disruption",
    description: "One facility-to-zone allocation gets distance +1 this round",
    effect: { type: "increase-distance", facilityId: "any", zoneId: "any", amount: 1 },
  },
  {
    id: "risk-4",
    type: "risk",
    name: "Demand Drop",
    description: "One selected zone demand decreases by 30%",
    effect: { type: "reduce-demand", zoneId: "any", percentage: 30 },
  },
  {
    id: "risk-5",
    type: "risk",
    name: "Audit Delay",
    description: "One upgrade benefit cannot be used this round",
    effect: { type: "disable-upgrade", facilityId: "any" },
  },
]

export const ALL_EVENT_CARDS = [...OPPORTUNITY_CARDS, ...RISK_CARDS]

// ============================================
// DEFAULT TAX CONFIG
// ============================================
export const DEFAULT_TAX_CONFIG: TaxConfig = {
  incomeTaxPercentage: 10,
  incomeTaxFlat: 250,
  luxuryTaxAmount: 400,
  usePercentageTax: false, // Default to flat 250
}

// ============================================
// CREATE DEFAULT TEAMS
// ============================================
export function createDefaultTeams(): Team[] {
  return [
    {
      id: 1,
      name: "Team Alpha",
      color: "#22c55e",
      colorClass: "bg-team1",
      position: 0,
      score: 0,
      isInJail: false,
      jailTurnsRemaining: 0,
      passedStartThisRound: false,
    },
    {
      id: 2,
      name: "Team Beta",
      color: "#3b82f6",
      colorClass: "bg-team2",
      position: 0,
      score: 0,
      isInJail: false,
      jailTurnsRemaining: 0,
      passedStartThisRound: false,
    },
    {
      id: 3,
      name: "Team Gamma",
      color: "#f97316",
      colorClass: "bg-team3",
      position: 0,
      score: 0,
      isInJail: false,
      jailTurnsRemaining: 0,
      passedStartThisRound: false,
    },
    {
      id: 4,
      name: "Team Delta",
      color: "#a855f7",
      colorClass: "bg-team4",
      position: 0,
      score: 0,
      isInJail: false,
      jailTurnsRemaining: 0,
      passedStartThisRound: false,
    },
  ]
}

// ============================================
// CREATE DEFAULT FACILITY OWNERSHIPS
// ============================================
export function createDefaultFacilityOwnerships(): FacilityOwnership[] {
  return FACILITIES.map((f) => ({
    facilityId: f.id,
    ownerId: null,
    isUpgraded: false,
    isFrozen: false,
    frozenRoundsRemaining: 0,
  }))
}

// ============================================
// CREATE NEW GAME SESSION
// ============================================
export function createNewSession(name: string, totalRounds: number = 4): GameSession {
  return {
    id: crypto.randomUUID(),
    name,
    createdAt: new Date(),
    status: "setup",
    currentRound: 1,
    totalRounds,
    currentTeamTurn: 1,
    transportRate: 0.5,
    teams: createDefaultTeams(),
    facilityOwnerships: createDefaultFacilityOwnerships(),
    roundDemands: JSON.parse(JSON.stringify(DEFAULT_ROUND_DEMANDS)),
    allocations: [],
    appliedEvents: [],
    costSummaries: [],
    transactionLogs: [],
    taxConfig: { ...DEFAULT_TAX_CONFIG },
    startBonus: 200,
  }
}

// ============================================
// SEEDED DEMO SESSION - Shows the app in action
// ============================================
export function createSeededDemoSession(): GameSession {
  const session = createNewSession("Demo Session - Supply Chain 101")
  session.status = "active"
  session.currentRound = 2
  session.currentTeamTurn = 3

  // Update team positions and names
  session.teams = [
    { ...session.teams[0], name: "Logistics Lions", position: 5, score: 2350 },
    { ...session.teams[1], name: "Supply Sharks", position: 8, score: 1980 },
    { ...session.teams[2], name: "Chain Champions", position: 2, score: 2150 },
    { ...session.teams[3], name: "Flow Masters", position: 11, score: 2420 },
  ]

  // Assign some facility ownerships
  session.facilityOwnerships = [
    { facilityId: 1, ownerId: 1, isUpgraded: false, isFrozen: false, frozenRoundsRemaining: 0 },
    { facilityId: 2, ownerId: 2, isUpgraded: true, isFrozen: false, frozenRoundsRemaining: 0 },
    { facilityId: 3, ownerId: 1, isUpgraded: false, isFrozen: true, frozenRoundsRemaining: 1 },
    { facilityId: 4, ownerId: null, isUpgraded: false, isFrozen: false, frozenRoundsRemaining: 0 },
    { facilityId: 5, ownerId: 4, isUpgraded: false, isFrozen: false, frozenRoundsRemaining: 0 },
    { facilityId: 6, ownerId: 3, isUpgraded: true, isFrozen: false, frozenRoundsRemaining: 0 },
  ]

  // Add some allocations for round 2
  session.allocations = [
    { teamId: 1, zoneId: "A", facilityId: 1, units: 400 },
    { teamId: 1, zoneId: "C", facilityId: 3, units: 300 },
    { teamId: 2, zoneId: "B", facilityId: 2, units: 500 },
    { teamId: 3, zoneId: "B", facilityId: 6, units: 450 },
    { teamId: 3, zoneId: "A", facilityId: 6, units: 300 },
    { teamId: 4, zoneId: "D", facilityId: 5, units: 350 },
  ]

  // Add some transaction logs
  session.transactionLogs = [
    {
      id: "log-1",
      timestamp: new Date(Date.now() - 3600000),
      round: 1,
      type: "purchase",
      teamId: 1,
      description: "Logistics Lions purchased City Micro Hub",
      amount: 500,
      facilityId: 1,
    },
    {
      id: "log-2",
      timestamp: new Date(Date.now() - 3000000),
      round: 1,
      type: "purchase",
      teamId: 2,
      description: "Supply Sharks purchased Regional Warehouse North",
      amount: 1200,
      facilityId: 2,
    },
    {
      id: "log-3",
      timestamp: new Date(Date.now() - 2400000),
      round: 1,
      type: "upgrade",
      teamId: 2,
      description: "Supply Sharks upgraded Regional Warehouse North with Process Automation",
      amount: 400,
      facilityId: 2,
    },
    {
      id: "log-4",
      timestamp: new Date(Date.now() - 1800000),
      round: 1,
      type: "round-close",
      teamId: 1,
      description: "Round 1 completed",
    },
    {
      id: "log-5",
      timestamp: new Date(Date.now() - 1200000),
      round: 2,
      type: "event",
      teamId: 1,
      description: "Labor Strike: Port Distribution Hub frozen for 1 round",
      facilityId: 3,
    },
  ]

  // Add round 1 cost summaries
  session.costSummaries = [
    {
      teamId: 1,
      round: 1,
      fixedCost: 1900,
      variableCost: 2800,
      transportCost: 1050,
      taxesPaid: 0,
      penaltiesPaid: 0,
      serviceFeesPaid: 0,
      subsidiesReceived: 0,
      bonusesReceived: 200,
      totalCost: 5550,
      facilityBreakdowns: [],
    },
    {
      teamId: 2,
      round: 1,
      fixedCost: 1200,
      variableCost: 1500,
      transportCost: 600,
      taxesPaid: 250,
      penaltiesPaid: 0,
      serviceFeesPaid: 0,
      subsidiesReceived: 0,
      bonusesReceived: 0,
      totalCost: 3550,
      facilityBreakdowns: [],
    },
  ]

  return session
}

// Get facility by ID
export function getFacilityById(id: number): Facility | undefined {
  return FACILITIES.find((f) => f.id === id)
}

// Get cell by index
export function getCellByIndex(index: number): BoardCell | undefined {
  return BOARD_CELLS.find((c) => c.index === index)
}

// Get event card by ID
export function getEventCardById(id: string): EventCard | undefined {
  return ALL_EVENT_CARDS.find((c) => c.id === id)
}
