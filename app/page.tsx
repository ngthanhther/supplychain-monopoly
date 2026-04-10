"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import {
  LayoutDashboard,
  Eye,
  Settings,
  History,
  Building2,
  Truck,
  Users,
  Target,
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/10 to-background border-b">
        <div className="container mx-auto px-4 py-16 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Building2 className="h-4 w-4" />
            Classroom Simulation Platform
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-balance">
            Supply Chain Monopoly
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            An interactive classroom simulator for Supply Chain Design and Analysis.
            Learn facility costs, transport logistics, and total cost minimization
            through Monopoly-inspired gameplay.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/admin">
              <Button size="lg" className="gap-2">
                <LayoutDashboard className="h-5 w-5" />
                Admin Dashboard
              </Button>
            </Link>
            <Link href="/viewer">
              <Button size="lg" variant="outline" className="gap-2">
                <Eye className="h-5 w-5" />
                Viewer Mode
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-2">Game Features</h2>
          <p className="text-muted-foreground">
            Everything you need to run an engaging supply chain simulation
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <Building2 className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">6 Facilities</CardTitle>
              <CardDescription>
                From micro hubs to mega distribution centers, each with unique
                costs and capacities
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Target className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">4 Customer Zones</CardTitle>
              <CardDescription>
                Urban retail, industrial parks, port hubs, and rural areas with
                varying demand
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">4 Teams</CardTitle>
              <CardDescription>
                Compete to minimize total costs while fulfilling all customer
                demand
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Truck className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">Real Calculations</CardTitle>
              <CardDescription>
                Fixed costs, variable costs, transport costs, and validation
                all computed automatically
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="container mx-auto px-4 py-8 pb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin">
            <Card className="h-full hover:border-primary transition-colors cursor-pointer">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <LayoutDashboard className="h-10 w-10 text-primary" />
                <div>
                  <h3 className="font-semibold">Admin Dashboard</h3>
                  <p className="text-sm text-muted-foreground">
                    Control the game, manage turns, apply events
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/viewer">
            <Card className="h-full hover:border-primary transition-colors cursor-pointer">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <Eye className="h-10 w-10 text-secondary" />
                <div>
                  <h3 className="font-semibold">Viewer Mode</h3>
                  <p className="text-sm text-muted-foreground">
                    Read-only view for projector display
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/settings">
            <Card className="h-full hover:border-primary transition-colors cursor-pointer">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <Settings className="h-10 w-10 text-muted-foreground" />
                <div>
                  <h3 className="font-semibold">Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure facilities, demands, and rules
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/history">
            <Card className="h-full hover:border-primary transition-colors cursor-pointer">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <History className="h-10 w-10 text-muted-foreground" />
                <div>
                  <h3 className="font-semibold">Session History</h3>
                  <p className="text-sm text-muted-foreground">
                    View past sessions and results
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          Supply Chain Monopoly - Classroom Simulator for Supply Chain Design and
          Analysis
        </div>
      </footer>
    </div>
  )
}
