// ============================================
// SUPPLY CHAIN MONOPOLY - GAME STATE STORE
// ============================================
// This module provides a Zustand store for managing
// game state with full action support.

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type {
  GameSession,
  TeamId,
  ZoneId,
  AdminAction,
  TransactionLog,
  DemandAllocation,
  CostBreakdown,
} from "./types"
import {
  createNewSession,
  createSeededDemoSession,
  getFacilityById,
  FACILITIES,
  BOARD_CELLS,
} from "./game-data"
import {
  calculateAllTeamCosts,
  validateRoundAllocations,
  calculateIncomeTax,
  calculateServiceFee,
} from "./calculations"

interface GameStore {
  // State
  currentSession: GameSession | null
  sessionHistory: GameSession[]

  // Session management
  createSession: (name: string, totalRounds?: number) => void
  loadDemoSession: () => void
  loadSession: (sessionId: string) => void
  saveSession: () => void
  deleteSession: (sessionId: string) => void
  startSession: () => void
  pauseSession: () => void
  resumeSession: () => void
  completeSession: () => void
  duplicateSession: (sessionId: string) => void

  // Admin actions
  executeAction: (action: AdminAction) => { success: boolean; error?: string }

  // Helper actions (convenience wrappers)
  moveTeam: (teamId: TeamId, diceRoll: number) => void
  purchaseFacility: (teamId: TeamId, facilityId: number) => void
  upgradeFacility: (teamId: TeamId, facilityId: number) => void
  freezeFacility: (facilityId: number, rounds: number) => void
  unfreezeFacility: (facilityId: number) => void
  sendToJail: (teamId: TeamId) => void
  releaseFromJail: (teamId: TeamId, payFee: boolean) => void
  applyEvent: (cardId: string, teamId: TeamId, facilityId?: number, zoneId?: ZoneId) => void
  applyTax: (teamId: TeamId, taxType: "income" | "luxury") => void
  applyServiceFee: (fromTeamId: TeamId, toTeamId: TeamId, facilityId: number) => void
  allocateDemand: (allocation: DemandAllocation) => void
  removeAllocation: (teamId: TeamId, zoneId: ZoneId, facilityId: number) => void
  setDemand: (round: number, zoneId: ZoneId, amount: number) => void
  closeRound: () => { success: boolean; errors?: string[] }
  nextTurn: () => void
  updateTeamName: (teamId: TeamId, name: string) => void
  updateTransportRate: (rate: number) => void
  updateTaxConfig: (config: Partial<GameSession["taxConfig"]>) => void
}

// Generate unique ID for logs
const generateLogId = () => `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      currentSession: null,
      sessionHistory: [],

      // ==========================================
      // SESSION MANAGEMENT
      // ==========================================

      createSession: (name, totalRounds = 4) => {
        const session = createNewSession(name, totalRounds)
        set({ currentSession: session })
      },

      loadDemoSession: () => {
        const session = createSeededDemoSession()
        set({ currentSession: session })
      },

      loadSession: (sessionId) => {
        const { sessionHistory } = get()
        const session = sessionHistory.find((s) => s.id === sessionId)
        if (session) {
          set({ currentSession: JSON.parse(JSON.stringify(session)) })
        }
      },

      saveSession: () => {
        const { currentSession, sessionHistory } = get()
        if (!currentSession) return

        const existingIndex = sessionHistory.findIndex((s) => s.id === currentSession.id)
        const updatedHistory =
          existingIndex >= 0
            ? [
                ...sessionHistory.slice(0, existingIndex),
                currentSession,
                ...sessionHistory.slice(existingIndex + 1),
              ]
            : [...sessionHistory, currentSession]

        set({ sessionHistory: updatedHistory })
      },

      deleteSession: (sessionId) => {
        set((state) => ({
          sessionHistory: state.sessionHistory.filter((s) => s.id !== sessionId),
          currentSession:
            state.currentSession?.id === sessionId ? null : state.currentSession,
        }))
      },

      startSession: () => {
        set((state) => {
          if (!state.currentSession) return state
          return {
            currentSession: {
              ...state.currentSession,
              status: "active",
            },
          }
        })
      },

      pauseSession: () => {
        set((state) => {
          if (!state.currentSession) return state
          return {
            currentSession: {
              ...state.currentSession,
              status: "paused",
            },
          }
        })
      },

      resumeSession: () => {
        set((state) => {
          if (!state.currentSession) return state
          return {
            currentSession: {
              ...state.currentSession,
              status: "active",
            },
          }
        })
      },

      completeSession: () => {
        set((state) => {
          if (!state.currentSession) return state
          return {
            currentSession: {
              ...state.currentSession,
              status: "completed",
            },
          }
        })
        get().saveSession()
      },

      duplicateSession: (sessionId) => {
        const { sessionHistory } = get()
        const original = sessionHistory.find((s) => s.id === sessionId)
        if (!original) return

        const duplicate: GameSession = {
          ...JSON.parse(JSON.stringify(original)),
          id: crypto.randomUUID(),
          name: `${original.name} (Copy)`,
          createdAt: new Date(),
          status: "setup",
        }
        set({ currentSession: duplicate })
      },

      // ==========================================
      // ADMIN ACTIONS
      // ==========================================

      executeAction: (action) => {
        const state = get()
        if (!state.currentSession) {
          return { success: false, error: "No active session" }
        }

        switch (action.type) {
          case "move-team":
            get().moveTeam(action.teamId, action.diceRoll || 0)
            return { success: true }

          case "purchase-facility":
            get().purchaseFacility(action.teamId, action.facilityId)
            return { success: true }

          case "upgrade-facility":
            get().upgradeFacility(action.teamId, action.facilityId)
            return { success: true }

          case "freeze-facility":
            get().freezeFacility(action.facilityId, action.rounds)
            return { success: true }

          case "unfreeze-facility":
            get().unfreezeFacility(action.facilityId)
            return { success: true }

          case "apply-event":
            get().applyEvent(action.cardId, action.teamId, action.facilityId, action.zoneId)
            return { success: true }

          case "apply-tax":
            get().applyTax(action.teamId, action.taxType)
            return { success: true }

          case "send-to-jail":
            get().sendToJail(action.teamId)
            return { success: true }

          case "release-from-jail":
            get().releaseFromJail(action.teamId, action.payFee)
            return { success: true }

          case "allocate-demand":
            get().allocateDemand(action.allocation)
            return { success: true }

          case "remove-allocation":
            get().removeAllocation(action.teamId, action.zoneId, action.facilityId)
            return { success: true }

          case "apply-service-fee":
            get().applyServiceFee(action.fromTeamId, action.toTeamId, action.facilityId)
            return { success: true }

          case "close-round":
            return get().closeRound()

          case "next-turn":
            get().nextTurn()
            return { success: true }

          case "set-demand":
            get().setDemand(action.round, action.zoneId, action.amount)
            return { success: true }

          default:
            return { success: false, error: "Unknown action type" }
        }
      },

      // ==========================================
      // HELPER ACTIONS
      // ==========================================

      moveTeam: (teamId, diceRoll) => {
        set((state) => {
          if (!state.currentSession) return state

          const teams = state.currentSession.teams.map((team) => {
            if (team.id !== teamId) return team

            const oldPosition = team.position
            const newPosition = (oldPosition + diceRoll) % 16
            const passedStart = diceRoll > 0 && newPosition < oldPosition

            return {
              ...team,
              position: newPosition,
              passedStartThisRound: passedStart,
            }
          })

          const team = teams.find((t) => t.id === teamId)!
          const cell = BOARD_CELLS[team.position]

          const log: TransactionLog = {
            id: generateLogId(),
            timestamp: new Date(),
            round: state.currentSession.currentRound,
            type: "move",
            teamId,
            description: `${state.currentSession.teams.find((t) => t.id === teamId)?.name} rolled ${diceRoll} and landed on ${cell.name}${team.passedStartThisRound ? " (passed Start)" : ""}`,
          }

          const logs = [...state.currentSession.transactionLogs, log]

          // Add start bonus log if passed start
          if (team.passedStartThisRound) {
            logs.push({
              id: generateLogId(),
              timestamp: new Date(),
              round: state.currentSession.currentRound,
              type: "start-bonus",
              teamId,
              description: `${state.currentSession.teams.find((t) => t.id === teamId)?.name} received stability bonus`,
              amount: -state.currentSession.startBonus,
            })
          }

          return {
            currentSession: {
              ...state.currentSession,
              teams,
              transactionLogs: logs,
            },
          }
        })
      },

      purchaseFacility: (teamId, facilityId) => {
        set((state) => {
          if (!state.currentSession) return state

          const facility = getFacilityById(facilityId)
          if (!facility) return state

          const ownerships = state.currentSession.facilityOwnerships.map((o) => {
            if (o.facilityId !== facilityId) return o
            return { ...o, ownerId: teamId }
          })

          const team = state.currentSession.teams.find((t) => t.id === teamId)
          const log: TransactionLog = {
            id: generateLogId(),
            timestamp: new Date(),
            round: state.currentSession.currentRound,
            type: "purchase",
            teamId,
            description: `${team?.name} purchased ${facility.name}`,
            amount: facility.purchasePrice,
            facilityId,
          }

          return {
            currentSession: {
              ...state.currentSession,
              facilityOwnerships: ownerships,
              transactionLogs: [...state.currentSession.transactionLogs, log],
            },
          }
        })
      },

      upgradeFacility: (teamId, facilityId) => {
        set((state) => {
          if (!state.currentSession) return state

          const facility = getFacilityById(facilityId)
          if (!facility) return state

          const ownerships = state.currentSession.facilityOwnerships.map((o) => {
            if (o.facilityId !== facilityId) return o
            return { ...o, isUpgraded: true }
          })

          const team = state.currentSession.teams.find((t) => t.id === teamId)
          const log: TransactionLog = {
            id: generateLogId(),
            timestamp: new Date(),
            round: state.currentSession.currentRound,
            type: "upgrade",
            teamId,
            description: `${team?.name} upgraded ${facility.name} with ${facility.upgradeName}`,
            amount: facility.upgradeCost,
            facilityId,
          }

          return {
            currentSession: {
              ...state.currentSession,
              facilityOwnerships: ownerships,
              transactionLogs: [...state.currentSession.transactionLogs, log],
            },
          }
        })
      },

      freezeFacility: (facilityId, rounds) => {
        set((state) => {
          if (!state.currentSession) return state

          const facility = getFacilityById(facilityId)
          if (!facility) return state

          const ownerships = state.currentSession.facilityOwnerships.map((o) => {
            if (o.facilityId !== facilityId) return o
            return { ...o, isFrozen: true, frozenRoundsRemaining: rounds }
          })

          const ownership = state.currentSession.facilityOwnerships.find(
            (o) => o.facilityId === facilityId
          )

          const log: TransactionLog = {
            id: generateLogId(),
            timestamp: new Date(),
            round: state.currentSession.currentRound,
            type: "freeze",
            teamId: ownership?.ownerId || 1,
            description: `${facility.name} frozen for ${rounds} round(s)`,
            facilityId,
          }

          return {
            currentSession: {
              ...state.currentSession,
              facilityOwnerships: ownerships,
              transactionLogs: [...state.currentSession.transactionLogs, log],
            },
          }
        })
      },

      unfreezeFacility: (facilityId) => {
        set((state) => {
          if (!state.currentSession) return state

          const facility = getFacilityById(facilityId)
          if (!facility) return state

          const ownerships = state.currentSession.facilityOwnerships.map((o) => {
            if (o.facilityId !== facilityId) return o
            return { ...o, isFrozen: false, frozenRoundsRemaining: 0 }
          })

          const ownership = state.currentSession.facilityOwnerships.find(
            (o) => o.facilityId === facilityId
          )

          const log: TransactionLog = {
            id: generateLogId(),
            timestamp: new Date(),
            round: state.currentSession.currentRound,
            type: "unfreeze",
            teamId: ownership?.ownerId || 1,
            description: `${facility.name} unfrozen`,
            facilityId,
          }

          return {
            currentSession: {
              ...state.currentSession,
              facilityOwnerships: ownerships,
              transactionLogs: [...state.currentSession.transactionLogs, log],
            },
          }
        })
      },

      sendToJail: (teamId) => {
        set((state) => {
          if (!state.currentSession) return state

          const teams = state.currentSession.teams.map((team) => {
            if (team.id !== teamId) return team
            return { ...team, isInJail: true, jailTurnsRemaining: 1, position: 9 }
          })

          const team = state.currentSession.teams.find((t) => t.id === teamId)
          const log: TransactionLog = {
            id: generateLogId(),
            timestamp: new Date(),
            round: state.currentSession.currentRound,
            type: "jail",
            teamId,
            description: `${team?.name} sent to Legal Hold`,
          }

          return {
            currentSession: {
              ...state.currentSession,
              teams,
              transactionLogs: [...state.currentSession.transactionLogs, log],
            },
          }
        })
      },

      releaseFromJail: (teamId, payFee) => {
        set((state) => {
          if (!state.currentSession) return state

          const teams = state.currentSession.teams.map((team) => {
            if (team.id !== teamId) return team
            return { ...team, isInJail: false, jailTurnsRemaining: 0 }
          })

          const team = state.currentSession.teams.find((t) => t.id === teamId)
          const log: TransactionLog = {
            id: generateLogId(),
            timestamp: new Date(),
            round: state.currentSession.currentRound,
            type: "release",
            teamId,
            description: `${team?.name} released from Legal Hold${payFee ? " (paid 300)" : ""}`,
            amount: payFee ? 300 : 0,
          }

          return {
            currentSession: {
              ...state.currentSession,
              teams,
              transactionLogs: [...state.currentSession.transactionLogs, log],
            },
          }
        })
      },

      applyEvent: (cardId, teamId, facilityId, zoneId) => {
        set((state) => {
          if (!state.currentSession) return state

          const appliedEvent = {
            id: generateLogId(),
            cardId,
            teamId,
            facilityId,
            zoneId,
            round: state.currentSession.currentRound,
          }

          const team = state.currentSession.teams.find((t) => t.id === teamId)
          const facility = facilityId ? getFacilityById(facilityId) : null

          const log: TransactionLog = {
            id: generateLogId(),
            timestamp: new Date(),
            round: state.currentSession.currentRound,
            type: "event",
            teamId,
            description: `Event ${cardId} applied to ${team?.name}${facility ? ` (${facility.name})` : ""}${zoneId ? ` (Zone ${zoneId})` : ""}`,
            facilityId,
          }

          return {
            currentSession: {
              ...state.currentSession,
              appliedEvents: [...state.currentSession.appliedEvents, appliedEvent],
              transactionLogs: [...state.currentSession.transactionLogs, log],
            },
          }
        })
      },

      applyTax: (teamId, taxType) => {
        set((state) => {
          if (!state.currentSession) return state

          const amount =
            taxType === "income"
              ? calculateIncomeTax(
                  state.currentSession,
                  teamId,
                  state.currentSession.currentRound
                )
              : state.currentSession.taxConfig.luxuryTaxAmount

          const team = state.currentSession.teams.find((t) => t.id === teamId)
          const log: TransactionLog = {
            id: generateLogId(),
            timestamp: new Date(),
            round: state.currentSession.currentRound,
            type: "tax",
            teamId,
            description: `${team?.name} paid ${taxType === "income" ? "Income" : "Luxury"} Tax`,
            amount,
          }

          return {
            currentSession: {
              ...state.currentSession,
              transactionLogs: [...state.currentSession.transactionLogs, log],
            },
          }
        })
      },

      applyServiceFee: (fromTeamId, toTeamId, facilityId) => {
        set((state) => {
          if (!state.currentSession) return state

          const amount = calculateServiceFee(facilityId)
          const facility = getFacilityById(facilityId)
          const fromTeam = state.currentSession.teams.find((t) => t.id === fromTeamId)
          const toTeam = state.currentSession.teams.find((t) => t.id === toTeamId)

          const log: TransactionLog = {
            id: generateLogId(),
            timestamp: new Date(),
            round: state.currentSession.currentRound,
            type: "service-fee",
            teamId: fromTeamId,
            description: `${fromTeam?.name} paid service fee to ${toTeam?.name} for ${facility?.name}`,
            amount,
            facilityId,
          }

          return {
            currentSession: {
              ...state.currentSession,
              transactionLogs: [...state.currentSession.transactionLogs, log],
            },
          }
        })
      },

      allocateDemand: (allocation) => {
        set((state) => {
          if (!state.currentSession) return state

          // Check if allocation already exists, update it
          const existingIndex = state.currentSession.allocations.findIndex(
            (a) =>
              a.teamId === allocation.teamId &&
              a.zoneId === allocation.zoneId &&
              a.facilityId === allocation.facilityId
          )

          let newAllocations: DemandAllocation[]
          if (existingIndex >= 0) {
            newAllocations = [...state.currentSession.allocations]
            newAllocations[existingIndex] = allocation
          } else {
            newAllocations = [...state.currentSession.allocations, allocation]
          }

          return {
            currentSession: {
              ...state.currentSession,
              allocations: newAllocations,
            },
          }
        })
      },

      removeAllocation: (teamId, zoneId, facilityId) => {
        set((state) => {
          if (!state.currentSession) return state

          return {
            currentSession: {
              ...state.currentSession,
              allocations: state.currentSession.allocations.filter(
                (a) =>
                  !(
                    a.teamId === teamId &&
                    a.zoneId === zoneId &&
                    a.facilityId === facilityId
                  )
              ),
            },
          }
        })
      },

      setDemand: (round, zoneId, amount) => {
        set((state) => {
          if (!state.currentSession) return state

          const roundDemands = state.currentSession.roundDemands.map((rd) => {
            if (rd.round !== round) return rd
            return {
              ...rd,
              demands: { ...rd.demands, [zoneId]: amount },
            }
          })

          return {
            currentSession: {
              ...state.currentSession,
              roundDemands,
            },
          }
        })
      },

      closeRound: () => {
        const state = get()
        if (!state.currentSession) {
          return { success: false, errors: ["No active session"] }
        }

        // Validate allocations
        const validation = validateRoundAllocations(
          state.currentSession,
          state.currentSession.currentRound
        )

        if (!validation.isValid) {
          return {
            success: false,
            errors: validation.errors.map((e) => e.message),
          }
        }

        // Calculate costs for all teams
        const costSummaries = calculateAllTeamCosts(
          state.currentSession,
          state.currentSession.currentRound
        )

        // Update teams with new scores
        const teams = state.currentSession.teams.map((team) => {
          const summary = costSummaries.find((cs) => cs.teamId === team.id)
          return {
            ...team,
            score: team.score + (summary?.totalCost || 0),
            passedStartThisRound: false, // Reset for next round
          }
        })

        // Decrement frozen rounds
        const facilityOwnerships = state.currentSession.facilityOwnerships.map((o) => {
          if (!o.isFrozen) return o
          const newRemaining = o.frozenRoundsRemaining - 1
          return {
            ...o,
            frozenRoundsRemaining: newRemaining,
            isFrozen: newRemaining > 0,
          }
        })

        const log: TransactionLog = {
          id: generateLogId(),
          timestamp: new Date(),
          round: state.currentSession.currentRound,
          type: "round-close",
          teamId: 1,
          description: `Round ${state.currentSession.currentRound} completed`,
        }

        const isLastRound =
          state.currentSession.currentRound >= state.currentSession.totalRounds

        set({
          currentSession: {
            ...state.currentSession,
            teams,
            facilityOwnerships,
            costSummaries: [...state.currentSession.costSummaries, ...costSummaries],
            transactionLogs: [...state.currentSession.transactionLogs, log],
            currentRound: isLastRound
              ? state.currentSession.currentRound
              : state.currentSession.currentRound + 1,
            currentTeamTurn: 1,
            allocations: isLastRound ? state.currentSession.allocations : [], // Clear allocations for new round
            status: isLastRound ? "completed" : state.currentSession.status,
          },
        })

        if (isLastRound) {
          get().saveSession()
        }

        return { success: true }
      },

      nextTurn: () => {
        set((state) => {
          if (!state.currentSession) return state

          const nextTeam =
            state.currentSession.currentTeamTurn === 4
              ? 1
              : ((state.currentSession.currentTeamTurn + 1) as TeamId)

          return {
            currentSession: {
              ...state.currentSession,
              currentTeamTurn: nextTeam,
            },
          }
        })
      },

      updateTeamName: (teamId, name) => {
        set((state) => {
          if (!state.currentSession) return state

          return {
            currentSession: {
              ...state.currentSession,
              teams: state.currentSession.teams.map((t) =>
                t.id === teamId ? { ...t, name } : t
              ),
            },
          }
        })
      },

      updateTransportRate: (rate) => {
        set((state) => {
          if (!state.currentSession) return state

          return {
            currentSession: {
              ...state.currentSession,
              transportRate: rate,
            },
          }
        })
      },

      updateTaxConfig: (config) => {
        set((state) => {
          if (!state.currentSession) return state

          return {
            currentSession: {
              ...state.currentSession,
              taxConfig: { ...state.currentSession.taxConfig, ...config },
            },
          }
        })
      },
    }),
    {
      name: "supply-chain-monopoly-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sessionHistory: state.sessionHistory,
      }),
    }
  )
)
