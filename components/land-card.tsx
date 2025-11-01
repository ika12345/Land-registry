"use client"

// Card component for displaying land parcels

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { formatAddress } from "@/lib/transaction-utils"
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/aptos-config"
import type { LandParcel } from "@/types/aptos"
import { MapPin, Ruler } from "lucide-react"

interface LandCardProps {
  land: LandParcel
  onClick?: () => void
}

export function LandCard({ land, onClick }: LandCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">Land #{land.land_id.toString()}</CardTitle>
            <CardDescription className="text-xs mt-1">{formatAddress(land.owner_wallet)}</CardDescription>
          </div>
          <StatusBadge status={land.status} labels={STATUS_LABELS} colors={STATUS_COLORS} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Ruler className="h-4 w-4 text-muted-foreground" />
          <span>{land.area_sq_meters.toString()} sq meters</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="truncate font-mono text-xs">{land.coordinates_cid.slice(0, 16)}...</span>
        </div>
        <div className="text-xs text-muted-foreground pt-2 border-t">
          Last updated: {new Date(Number(land.last_updated_timestamp) * 1000).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  )
}
