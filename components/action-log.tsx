"use client"

import { TransactionLog, Team } from "@/lib/types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn, formatDate, formatCurrency, getTeamColorClass } from "@/lib/utils"
import {
  ShoppingCart,
  ArrowUp,
  Snowflake,
  Sun,
  Receipt,
  Sparkles,
  Move,
  Lock,
  Unlock,
  Play,
  CheckCircle,
} from "lucide-react"

interface ActionLogProps {
  logs: TransactionLog[]
  teams: Team[]
  maxHeight?: string
  showRoundFilter?: boolean
  currentRound?: number
}

const logTypeIcons: Record<string, React.ReactNode> = {
  purchase: <ShoppingCart className="h-3 w-3" />,
  upgrade: <ArrowUp className="h-3 w-3" />,
  freeze: <Snowflake className="h-3 w-3" />,
  unfreeze: <Sun className="h-3 w-3" />,
  tax: <Receipt className="h-3 w-3" />,
  "service-fee": <Receipt className="h-3 w-3" />,
  event: <Sparkles className="h-3 w-3" />,
  allocation: <Move className="h-3 w-3" />,
  "round-close": <CheckCircle className="h-3 w-3" />,
  move: <Move className="h-3 w-3" />,
  jail: <Lock className="h-3 w-3" />,
  release: <Unlock className="h-3 w-3" />,
  "start-bonus": <Play className="h-3 w-3" />,
}

const logTypeColors: Record<string, string> = {
  purchase: "bg-blue-100 text-blue-700",
  upgrade: "bg-yellow-100 text-yellow-700",
  freeze: "bg-red-100 text-red-700",
  unfreeze: "bg-green-100 text-green-700",
  tax: "bg-purple-100 text-purple-700",
  "service-fee": "bg-purple-100 text-purple-700",
  event: "bg-orange-100 text-orange-700",
  allocation: "bg-sky-100 text-sky-700",
  "round-close": "bg-emerald-100 text-emerald-700",
  move: "bg-slate-100 text-slate-700",
  jail: "bg-red-100 text-red-700",
  release: "bg-green-100 text-green-700",
  "start-bonus": "bg-emerald-100 text-emerald-700",
}

export function ActionLog({
  logs,
  teams,
  maxHeight = "400px",
  showRoundFilter = false,
  currentRound,
}: ActionLogProps) {
  // Sort logs by timestamp descending (most recent first)
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  // Filter by round if needed
  const filteredLogs = showRoundFilter && currentRound
    ? sortedLogs.filter((log) => log.round === currentRound)
    : sortedLogs

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span>Activity Log</span>
          <Badge variant="outline">{filteredLogs.length} actions</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea style={{ height: maxHeight }} className="px-4 pb-4">
          {filteredLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No activity yet
            </p>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map((log) => {
                const team = teams.find((t) => t.id === log.teamId)
                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-2 p-2 rounded-lg bg-muted/50"
                  >
                    <div
                      className={cn(
                        "p-1.5 rounded-full",
                        logTypeColors[log.type] || "bg-slate-100 text-slate-700"
                      )}
                    >
                      {logTypeIcons[log.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full",
                            getTeamColorClass(log.teamId)
                          )}
                        />
                        <span className="text-sm font-medium truncate">
                          {log.description}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                        <span>Round {log.round}</span>
                        <span>|</span>
                        <span>{formatDate(log.timestamp)}</span>
                        {log.amount !== undefined && log.amount !== 0 && (
                          <>
                            <span>|</span>
                            <span
                              className={cn(
                                "font-mono",
                                log.amount < 0
                                  ? "text-green-600"
                                  : "text-foreground"
                              )}
                            >
                              {log.amount < 0 ? "-" : "+"}$
                              {formatCurrency(Math.abs(log.amount))}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
