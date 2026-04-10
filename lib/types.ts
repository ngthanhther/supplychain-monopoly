// ============================================
// SUPPLY CHAIN MONOPOLY - TYPE DEFINITIONS
// ============================================

// Team definitions
export type TeamId = 1 | 2 | 3 | 4

export interface Team {
  id: TeamId
  name: string
  color: string
  colorClass: string
  position: number // 0-15 on the board
  score: number // Lower is better (total cost)
  isInJail: boolean
  jailTurnsRemaining: number
  passedStartThisRound: boolean
}

// Customer zone definitions
export type ZoneId = "A" | "B" | "C" | "D"

export interface CustomerZone {
  id: ZoneId
  name: string
  description: string
}

// Facility definitions
export interface Facility {
  id: number
  name: string
  cellIndex: number
  purchasePrice: number
  fixedCost: number
  variableCost: number
  capacity: number
  serviceFee: number
  buybackPrice: number
  upgradeName: string
  upgradeCost: number
  upgradeCapacityBonus?: number
  upgradeVariableCostDelta?: number
  distances: Record<ZoneId, number>
}

// Facility ownership state
export interface FacilityOwnership {
  facilityId: number
  ownerId: TeamId | null
  isUpgraded: boolean
  isFrozen: boolean
  frozenRoundsRemaining: number
}

// Board cell types
export type CellType =
  | "start"
  | "facility"
  | "opportunity"
  | "risk"
  | "income-tax"
  | "luxury-tax"
  | "jail"
  | "free-parking"
  | "market-review"
  | "negotiation"

export interface BoardCell {
  index: number
  type: CellType
  name: string
  facilityId?: number
  description?: string
}

// Round demand configuration
export interface RoundDemand {
  round: number
  demands: Record<ZoneId, number>
}

// Demand allocation from a team
export interface DemandAllocation {
  teamId: TeamId
  zoneId: ZoneId
  facilityId: number
  units: number
}

// Event card definitions
export type EventType = "opportunity" | "risk"

export interface EventCard {
  id: string
  type: EventType
  name: string
  description: string
  effect: EventEffect
}

export type EventEffect =
  | { type: "reduce-fixed-cost"; amount: number }
  | { type: "reduce-variable-cost"; facilityId: number | "any"; amount: number }
  | { type: "increase-demand"; zoneId: ZoneId | "any"; amount: number }
  | { type: "immediate-upgrade"; facilityId: number | "any" }
  | { type: "freeze-facility"; facilityId: number | "any"; rounds: number }
  | { type: "increase-variable-cost"; facilityId: number | "any"; amount: number }
  | { type: "increase-distance"; facilityId: number | "any"; zoneId: ZoneId | "any"; amount: number }
  | { type: "reduce-demand"; zoneId: ZoneId | "any"; percentage: number }
  | { type: "disable-upgrade"; facilityId: number | "any" }

// Applied event for a round
export interface AppliedEvent {
  id: string
  cardId: string
  teamId: TeamId
  facilityId?: number
  zoneId?: ZoneId
  round: number
}

// Tax configuration
export interface TaxConfig {
  incomeTaxPercentage: number
  incomeTaxFlat: number
  luxuryTaxAmount: number
  usePercentageTax: boolean
}

// Cost breakdown for a team in a round
export interface CostBreakdown {
  teamId: TeamId
  round: number
  fixedCost: number
  variableCost: number
  transportCost: number
  taxesPaid: number
  penaltiesPaid: number
  serviceFeesPaid: number
  subsidiesReceived: number
  bonusesReceived: number
  totalCost: number
  // Detailed breakdowns
  facilityBreakdowns: FacilityCostBreakdown[]
}

export interface FacilityCostBreakdown {
  facilityId: number
  facilityName: string
  fixedCost: number
  variableCost: number
  transportCost: number
  unitsServed: number
  allocations: {
    zoneId: ZoneId
    units: number
    distance: number
    transportCost: number
  }[]
}

// Validation result
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  type: "unassigned-demand" | "capacity-exceeded" | "frozen-facility" | "unowned-facility"
  message: string
  zoneId?: ZoneId
  facilityId?: number
  teamId?: TeamId
}

export interface ValidationWarning {
  type: "idle-capacity" | "high-transport-cost"
  message: string
  facilityId?: number
}

// Transaction log entry
export interface TransactionLog {
  id: string
  timestamp: Date
  round: number
  type:
    | "purchase"
    | "upgrade"
    | "freeze"
    | "unfreeze"
    | "tax"
    | "service-fee"
    | "event"
    | "allocation"
    | "round-close"
    | "move"
    | "jail"
    | "release"
    | "start-bonus"
  teamId: TeamId
  description: string
  amount?: number
  facilityId?: number
}

// Session state
export type SessionStatus = "setup" | "active" | "paused" | "completed"

export interface GameSession {
  id: string
  name: string
  createdAt: Date
  status: SessionStatus
  currentRound: number
  totalRounds: number
  currentTeamTurn: TeamId
  transportRate: number
  teams: Team[]
  facilityOwnerships: FacilityOwnership[]
  roundDemands: RoundDemand[]
  allocations: DemandAllocation[]
  appliedEvents: AppliedEvent[]
  costSummaries: CostBreakdown[]
  transactionLogs: TransactionLog[]
  taxConfig: TaxConfig
  startBonus: number
}

// Action types for admin operations
export type AdminAction =
  | { type: "move-team"; teamId: TeamId; newPosition: number; diceRoll?: number }
  | { type: "purchase-facility"; teamId: TeamId; facilityId: number }
  | { type: "upgrade-facility"; teamId: TeamId; facilityId: number }
  | { type: "freeze-facility"; facilityId: number; rounds: number }
  | { type: "unfreeze-facility"; facilityId: number }
  | { type: "apply-event"; cardId: string; teamId: TeamId; facilityId?: number; zoneId?: ZoneId }
  | { type: "apply-tax"; teamId: TeamId; amount: number; taxType: "income" | "luxury" }
  | { type: "send-to-jail"; teamId: TeamId }
  | { type: "release-from-jail"; teamId: TeamId; payFee: boolean }
  | { type: "allocate-demand"; allocation: DemandAllocation }
  | { type: "remove-allocation"; teamId: TeamId; zoneId: ZoneId; facilityId: number }
  | { type: "apply-service-fee"; fromTeamId: TeamId; toTeamId: TeamId; facilityId: number }
  | { type: "close-round" }
  | { type: "next-turn" }
  | { type: "set-demand"; round: number; zoneId: ZoneId; amount: number }
