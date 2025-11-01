"use client"

// Land Management page - list view with filters

import { useState } from "react"
import { useAllLands } from "@/hooks/use-all-lands"
import { useUserRole } from "@/hooks/use-user-role"
import { useAptosAccount } from "@/hooks/use-aptos-account"
import { LandCard } from "@/components/land-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LAND_STATUS, STATUS_LABELS } from "@/lib/aptos-config"
import { Search, Plus } from "lucide-react"

export default function LandManagementPage() {
  const router = useRouter()
  const { address } = useAptosAccount()
  const { role } = useUserRole(address)
  const { lands, isLoading, error } = useAllLands()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null) // Set to null instead of empty string for proper Select handling

  // Filter lands based on search and status
  const filteredLands = lands.filter((land) => {
    const matchesSearch =
      land.land_id.toString().includes(searchQuery) ||
      land.owner_wallet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      land.coordinates_cid.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === null || land.status.toString() === statusFilter // Check for null instead of falsy

    return matchesSearch && matchesStatus
  })

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Land Management</h1>
              <p className="text-sm text-muted-foreground mt-1">View and manage land parcels</p>
            </div>
            {role === "PATWARI" && (
              <Link href="/land/register">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Register New Land
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4 flex-col sm:flex-row">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by ID, address, or coordinates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <Select
                value={statusFilter || ""}
                onValueChange={(value) => setStatusFilter(value === "" ? null : value)}
              >
                {" "}
                {/* Use empty string for display, convert to null internally */}
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LAND_STATUS).map(([label, value]) => (
                    <SelectItem key={value} value={value.toString()}>
                      {STATUS_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lands Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="h-8 w-8" />
          </div>
        ) : error ? (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Error Loading Lands</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{error}</p>
            </CardContent>
          </Card>
        ) : filteredLands.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No lands found</CardTitle>
              <CardDescription>
                {lands.length === 0
                  ? "No land parcels have been registered yet"
                  : "No lands match your search criteria"}
              </CardDescription>
            </CardHeader>
            {role === "PATWARI" && (
              <CardContent>
                <Link href="/land/register">
                  <Button>Register First Land</Button>
                </Link>
              </CardContent>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLands.map((land) => (
              <div
                key={land.land_id.toString()}
                onClick={() => router.push(`/land/${land.land_id}`)}
                className="cursor-pointer"
              >
                <LandCard land={land} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
