"use client"

// Dashboard page - main entry point

import { useAptosAccount } from "@/hooks/use-aptos-account"
import { useAccountStats } from "@/hooks/use-account-stats"
import { useUserRole } from "@/hooks/use-user-role"
import { RoleBadge } from "@/components/role-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import Link from "next/link"
import { BarChart3, FileText, Shield, Gavel } from "lucide-react"

export default function DashboardPage() {
  const { address, isConnected, isLoading: accountLoading, connect } = useAptosAccount()
  const { role, isLoading: roleLoading } = useUserRole(address)
  const { stats, isLoading: statsLoading } = useAccountStats(address)

  const isLoading = accountLoading || roleLoading || statsLoading

  if (accountLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!isConnected || !address) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Land Registry & Insurance dApp</h1>
          <p className="text-muted-foreground">Connect your Aptos wallet to get started</p>
        </div>
        <Button size="lg" onClick={() => connect()}>
          Connect Wallet
        </Button>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Land Registry Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">Blockchain-powered land documentation</p>
            </div>
            <div className="flex items-center gap-4">
              {role && (
                <RoleBadge role={role === "PATWARI" ? 1 : role === "TEHSILDAR" ? 2 : role === "DLR" ? 3 : null} />
              )}
              <div className="text-sm">
                <div className="font-mono">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Lands Owned
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <div className="text-2xl font-bold">{stats.landsOwned}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Total registered</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Active Policies
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <div className="text-2xl font-bold">{stats.activePolicies}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Insurance coverage</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Gavel className="h-4 w-4" />
                Pending Claims
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <div className="text-2xl font-bold">{stats.pendingClaims}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Finalized Lands
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <div className="text-2xl font-bold">{stats.finalizedLands}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Verified</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Land Management</CardTitle>
              <CardDescription>Register, view, and transfer land parcels</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/land">
                <Button className="w-full">Manage Lands</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Insurance Management</CardTitle>
              <CardDescription>Create policies and manage claims</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/insurance">
                <Button className="w-full">Manage Insurance</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Role-based Actions */}
        {role && (
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {role === "PATWARI" && (
                <Link href="/land/register">
                  <Button className="w-full">Register New Land</Button>
                </Link>
              )}
              {(role === "TEHSILDAR" || role === "DLR") && (
                <div className="text-sm text-muted-foreground">
                  Pending approval workflows available in Land Management
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
