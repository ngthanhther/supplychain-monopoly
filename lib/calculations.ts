// ============================================
// SUPPLY CHAIN MONOPOLY - CALCULATION ENGINE
// ============================================
// This module contains all the core cost calculation
// and validation logic for the simulation.

import type {
  GameSession,
  TeamId,
  ZoneId,
  CostBreakdown,
  FacilityCostBreakdown,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  DemandAllocation,
  FacilityOwnership,
  AppliedEvent,
} from "./types"
import { FACILITIES, getFacilityById } from "./game-data"

// ============================================
// EFFECTIVE VALUES (with upgrades and events)
// ============================================

/**
 * Get the effective capacity of a facility, considering upgrades and events
 */
export function getEffectiveCapacity(
  facilityId: number,
  ownership: FacilityOwnership,
  appliedEvents: AppliedEvent[],
  round: number
): number {
  const facility = getFacilityById(facilityId)
  if (!facility) return 0

  let capacity = facility.capacity

  // Add upgrade bonus if upgraded and not disabled by event
  if (ownership.isUpgraded && facility.upgradeCapacityBonus) {
    const upgradeDisabled = appliedEvents.some(
      (e) => e.round === round && e.facilityId === facilityId && e.cardId === "risk-5"
    )
    if (!upgradeDisabled) {
      capacity += facility.upgradeCapacityBonus
    }
  }

  return capacity
}

/**
 * Get the effective variable cost of a facility, considering upgrades and events
 */
export function getEffectiveVariableCost(
  facilityId: number,
  ownership: FacilityOwnership,
  appliedEvents: AppliedEvent[],
  round: number
): number {
  const facility = getFacilityById(facilityId)
  if (!facility) return 0

  let variableCost = facility.variableCost

  // Apply upgrade delta if upgraded and not disabled
  if (ownership.isUpgraded && facility.upgradeVariableCostDelta) {
    const upgradeDisabled = appliedEvents.some(
      (e) => e.round === round && e.facilityId === facilityId && e.cardId === "risk-5"
    )
    if (!upgradeDisabled) {
      variableCost += facility.upgradeVariableCostDelta
    }
  }

  // Apply opportunity card: reduce variable cost
  const reduceVarCostEvent = appliedEvents.find(
    (e) =>
      e.round === round &&
      e.cardId === "opp-2" &&
      (e.facilityId === facilityId || e.facilityId === undefined)
  )
  if (reduceVarCostEvent) {
    variableCost -= 0.5
  }

  // Apply risk card: increase variable cost
  const increaseVarCostEvent = appliedEvents.find(
    (e) => e.round === round && e.cardId === "risk-2" && e.facilityId === facilityId
  )
  if (increaseVarCostEvent) {
    variableCost += 0.7
  }

  return Math.max(0, variableCost)
}

/**
 * Get the effective distance for a facility-zone pair, considering events
 */
export function getEffectiveDistance(
  facilityId: number,
  zoneId: ZoneId,
  appliedEvents: AppliedEvent[],
  round: number
): number {
  const facility = getFacilityById(facilityId)
  if (!facility) return 3

  let distance = facility.distances[zoneId]

  // Apply risk card: increase distance
  const increaseDistEvent = appliedEvents.find(
    (e) =>
      e.round === round &&
      e.cardId === "risk-3" &&
      e.facilityId === facilityId &&
      e.zoneId === zoneId
  )
  if (increaseDistEvent) {
    distance += 1
  }

  return Math.min(distance, 4) // Cap at 4
}

/**
 * Get the effective fixed cost for a team, considering events
 */
export function getEffectiveFixedCostReduction(
  teamId: TeamId,
  appliedEvents: AppliedEvent[],
  round: number
): number {
  const subsidyEvent = appliedEvents.find(
    (e) => e.round === round && e.teamId === teamId && e.cardId === "opp-1"
  )
  return subsidyEvent ? 300 : 0
}

// ============================================
// DEMAND CALCULATIONS
// ============================================

/**
 * Get the effective demand for a zone in a round, considering events
 */
export function getEffectiveDemand(
  session: GameSession,
  zoneId: ZoneId,
  round: number
): number {
  const roundDemand = session.roundDemands.find((rd) => rd.round === round)
  if (!roundDemand) return 0

  let demand = roundDemand.demands[zoneId]

  // Apply opportunity card: increase demand
  const increaseDemandEvent = session.appliedEvents.find(
    (e) => e.round === round && e.cardId === "opp-3" && e.zoneId === zoneId
  )
  if (increaseDemandEvent) {
    demand += 200
  }

  // Apply risk card: reduce demand by percentage
  const reduceDemandEvent = session.appliedEvents.find(
    (e) => e.round === round && e.cardId === "risk-4" && e.zoneId === zoneId
  )
  if (reduceDemandEvent) {
    demand = Math.floor(demand * 0.7) // 30% reduction
  }

  return demand
}

/**
 * Get total allocated units for a zone across all teams
 */
export function getTotalAllocatedForZone(
  allocations: DemandAllocation[],
  zoneId: ZoneId,
  round: number
): number {
  return allocations
    .filter((a) => a.zoneId === zoneId)
    .reduce((sum, a) => sum + a.units, 0)
}

/**
 * Get total units allocated to a facility by a team
 */
export function getTotalAllocatedToFacility(
  allocations: DemandAllocation[],
  facilityId: number,
  teamId?: TeamId
): number {
  return allocations
    .filter((a) => a.facilityId === facilityId && (teamId === undefined || a.teamId === teamId))
    .reduce((sum, a) => sum + a.units, 0)
}

/**
 * Get remaining demand for a zone
 */
export function getRemainingDemand(
  session: GameSession,
  zoneId: ZoneId,
  round: number
): number {
  const effectiveDemand = getEffectiveDemand(session, zoneId, round)
  const allocated = getTotalAllocatedForZone(session.allocations, zoneId, round)
  return Math.max(0, effectiveDemand - allocated)
}

/**
 * Get remaining capacity for a facility
 */
export function getRemainingCapacity(
  session: GameSession,
  facilityId: number,
  round: number
): number {
  const ownership = session.facilityOwnerships.find((o) => o.facilityId === facilityId)
  if (!ownership) return 0

  const effectiveCapacity = getEffectiveCapacity(
    facilityId,
    ownership,
    session.appliedEvents,
    round
  )
  const allocated = getTotalAllocatedToFacility(session.allocations, facilityId)
  return Math.max(0, effectiveCapacity - allocated)
}

// ============================================
// VALIDATION ENGINE
// ============================================

/**
 * Validate all demand allocations for a round
 * Returns validation errors that must be resolved before closing the round
 */
export function validateRoundAllocations(
  session: GameSession,
  round: number
): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  const zones: ZoneId[] = ["A", "B", "C", "D"]

  // Check 1: All demand must be fully assigned
  for (const zoneId of zones) {
    const effectiveDemand = getEffectiveDemand(session, zoneId, round)
    const allocated = getTotalAllocatedForZone(session.allocations, zoneId, round)

    if (allocated < effectiveDemand) {
      errors.push({
        type: "unassigned-demand",
        message: `Zone ${zoneId} has ${effectiveDemand - allocated} unassigned units (${allocated}/${effectiveDemand})`,
        zoneId,
      })
    }
  }

  // Check 2: No facility can exceed its capacity
  for (const ownership of session.facilityOwnerships) {
    const facility = getFacilityById(ownership.facilityId)
    if (!facility) continue

    const effectiveCapacity = getEffectiveCapacity(
      ownership.facilityId,
      ownership,
      session.appliedEvents,
      round
    )
    const allocated = getTotalAllocatedToFacility(session.allocations, ownership.facilityId)

    if (allocated > effectiveCapacity) {
      errors.push({
        type: "capacity-exceeded",
        message: `${facility.name} exceeds capacity (${allocated}/${effectiveCapacity})`,
        facilityId: ownership.facilityId,
      })
    }

    // Warning for idle capacity
    if (ownership.ownerId && allocated < effectiveCapacity * 0.5 && !ownership.isFrozen) {
      warnings.push({
        type: "idle-capacity",
        message: `${facility.name} has significant idle capacity (${Math.round((1 - allocated / effectiveCapacity) * 100)}% unused)`,
        facilityId: ownership.facilityId,
      })
    }
  }

  // Check 3: Frozen facilities cannot serve demand
  for (const allocation of session.allocations) {
    const ownership = session.facilityOwnerships.find(
      (o) => o.facilityId === allocation.facilityId
    )
    if (ownership?.isFrozen) {
      const facility = getFacilityById(allocation.facilityId)
      errors.push({
        type: "frozen-facility",
        message: `${facility?.name || "Facility"} is frozen and cannot serve demand`,
        facilityId: allocation.facilityId,
        teamId: allocation.teamId,
      })
    }
  }

  // Check 4: Teams can only allocate to facilities they own
  // (unless admin allows negotiated access - handled separately)
  for (const allocation of session.allocations) {
    const ownership = session.facilityOwnerships.find(
      (o) => o.facilityId === allocation.facilityId
    )
    if (ownership && ownership.ownerId !== allocation.teamId && ownership.ownerId !== null) {
      const facility = getFacilityById(allocation.facilityId)
      errors.push({
        type: "unowned-facility",
        message: `Team ${allocation.teamId} cannot allocate to ${facility?.name || "facility"} (owned by Team ${ownership.ownerId})`,
        facilityId: allocation.facilityId,
        teamId: allocation.teamId,
      })
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

// ============================================
// COST CALCULATION ENGINE
// ============================================

/**
 * Calculate complete cost breakdown for a team in a round
 * This is the core calculation engine.
 */
export function calculateTeamCosts(
  session: GameSession,
  teamId: TeamId,
  round: number
): CostBreakdown {
  const team = session.teams.find((t) => t.id === teamId)
  if (!team) {
    return createEmptyCostBreakdown(teamId, round)
  }

  const teamAllocations = session.allocations.filter((a) => a.teamId === teamId)
  const teamOwnerships = session.facilityOwnerships.filter((o) => o.ownerId === teamId)

  // Calculate facility-level breakdowns
  const facilityBreakdowns: FacilityCostBreakdown[] = []
  let totalFixedCost = 0
  let totalVariableCost = 0
  let totalTransportCost = 0

  for (const ownership of teamOwnerships) {
    const facility = getFacilityById(ownership.facilityId)
    if (!facility) continue

    // Skip frozen facilities for cost calculation (they still incur fixed cost)
    const facilityAllocations = teamAllocations.filter(
      (a) => a.facilityId === ownership.facilityId
    )

    // Fixed cost (always applies for owned facilities)
    const fixedCost = ownership.isFrozen ? facility.fixedCost : facility.fixedCost

    // Variable cost per unit
    const effectiveVarCost = getEffectiveVariableCost(
      ownership.facilityId,
      ownership,
      session.appliedEvents,
      round
    )

    // Calculate per-zone allocations
    const allocationDetails: FacilityCostBreakdown["allocations"] = []
    let facilityVariableCost = 0
    let facilityTransportCost = 0
    let unitsServed = 0

    for (const allocation of facilityAllocations) {
      const distance = getEffectiveDistance(
        ownership.facilityId,
        allocation.zoneId,
        session.appliedEvents,
        round
      )

      // Variable cost = units × variable cost per unit
      const varCost = allocation.units * effectiveVarCost

      // Transport cost = units × distance × transport rate
      const transportCost = allocation.units * distance * session.transportRate

      allocationDetails.push({
        zoneId: allocation.zoneId,
        units: allocation.units,
        distance,
        transportCost,
      })

      facilityVariableCost += varCost
      facilityTransportCost += transportCost
      unitsServed += allocation.units
    }

    facilityBreakdowns.push({
      facilityId: ownership.facilityId,
      facilityName: facility.name,
      fixedCost,
      variableCost: facilityVariableCost,
      transportCost: facilityTransportCost,
      unitsServed,
      allocations: allocationDetails,
    })

    totalFixedCost += fixedCost
    totalVariableCost += facilityVariableCost
    totalTransportCost += facilityTransportCost
  }

  // Apply fixed cost reduction from events
  const fixedCostReduction = getEffectiveFixedCostReduction(
    teamId,
    session.appliedEvents,
    round
  )
  totalFixedCost = Math.max(0, totalFixedCost - fixedCostReduction)

  // Calculate taxes paid (from transaction logs)
  const taxesPaid = session.transactionLogs
    .filter((log) => log.round === round && log.teamId === teamId && log.type === "tax")
    .reduce((sum, log) => sum + (log.amount || 0), 0)

  // Calculate service fees paid
  const serviceFeesPaid = session.transactionLogs
    .filter(
      (log) => log.round === round && log.teamId === teamId && log.type === "service-fee"
    )
    .reduce((sum, log) => sum + (log.amount || 0), 0)

  // Calculate penalties (jail release, etc.)
  const penaltiesPaid = session.transactionLogs
    .filter(
      (log) =>
        log.round === round &&
        log.teamId === teamId &&
        (log.type === "release" || log.type === "jail")
    )
    .reduce((sum, log) => sum + (log.amount || 0), 0)

  // Calculate subsidies received
  const subsidiesReceived = fixedCostReduction

  // Calculate bonuses (start bonus)
  const bonusesReceived = team.passedStartThisRound ? session.startBonus : 0

  // Total cost calculation
  // Formula: fixedCost + variableCost + transportCost + penalties + taxes + serviceFees - subsidies - bonuses
  const totalCost =
    totalFixedCost +
    totalVariableCost +
    totalTransportCost +
    penaltiesPaid +
    taxesPaid +
    serviceFeesPaid -
    subsidiesReceived -
    bonusesReceived

  return {
    teamId,
    round,
    fixedCost: totalFixedCost,
    variableCost: totalVariableCost,
    transportCost: totalTransportCost,
    taxesPaid,
    penaltiesPaid,
    serviceFeesPaid,
    subsidiesReceived,
    bonusesReceived,
    totalCost: Math.max(0, totalCost),
    facilityBreakdowns,
  }
}

/**
 * Calculate costs for all teams in a round
 */
export function calculateAllTeamCosts(
  session: GameSession,
  round: number
): CostBreakdown[] {
  return session.teams.map((team) => calculateTeamCosts(session, team.id, round))
}

/**
 * Create an empty cost breakdown
 */
function createEmptyCostBreakdown(teamId: TeamId, round: number): CostBreakdown {
  return {
    teamId,
    round,
    fixedCost: 0,
    variableCost: 0,
    transportCost: 0,
    taxesPaid: 0,
    penaltiesPaid: 0,
    serviceFeesPaid: 0,
    subsidiesReceived: 0,
    bonusesReceived: 0,
    totalCost: 0,
    facilityBreakdowns: [],
  }
}

// ============================================
// CUMULATIVE SCORE CALCULATIONS
// ============================================

/**
 * Get cumulative score (total cost) for a team across all rounds
 */
export function getCumulativeScore(session: GameSession, teamId: TeamId): number {
  return session.costSummaries
    .filter((cs) => cs.teamId === teamId)
    .reduce((sum, cs) => sum + cs.totalCost, 0)
}

/**
 * Get team rankings (lowest cost first)
 */
export function getTeamRankings(
  session: GameSession
): Array<{ teamId: TeamId; totalCost: number; rank: number }> {
  const scores = session.teams.map((team) => ({
    teamId: team.id,
    totalCost: getCumulativeScore(session, team.id),
  }))

  // Sort by total cost (ascending - lower is better)
  scores.sort((a, b) => a.totalCost - b.totalCost)

  return scores.map((score, index) => ({
    ...score,
    rank: index + 1,
  }))
}

// ============================================
// UTILITY CALCULATIONS
// ============================================

/**
 * Calculate income tax amount
 */
export function calculateIncomeTax(
  session: GameSession,
  teamId: TeamId,
  round: number
): number {
  const { taxConfig } = session

  if (taxConfig.usePercentageTax) {
    // Calculate 10% of current round fixed costs
    const teamOwnerships = session.facilityOwnerships.filter((o) => o.ownerId === teamId)
    const totalFixedCost = teamOwnerships.reduce((sum, ownership) => {
      const facility = getFacilityById(ownership.facilityId)
      return sum + (facility?.fixedCost || 0)
    }, 0)
    return Math.round(totalFixedCost * (taxConfig.incomeTaxPercentage / 100))
  }

  return taxConfig.incomeTaxFlat
}

/**
 * Calculate service fee for landing on another team's facility
 */
export function calculateServiceFee(facilityId: number): number {
  const facility = getFacilityById(facilityId)
  return facility?.serviceFee || 0
}

/**
 * Check if a team can afford a purchase/action
 */
export function canAfford(currentScore: number, cost: number): boolean {
  // In this game, higher score (cost) is worse, so we always allow purchases
  // The cost just gets added to their total
  return true
}
