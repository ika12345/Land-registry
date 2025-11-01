"use client"

// Card component for displaying insurance policies

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { formatAddress } from "@/lib/transaction-utils"
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/aptos-config"
import type { Policy } from "@/types/aptos"
import { Shield, User } from "lucide-react"

interface PolicyCardProps {
  policy: Policy
  onClick?: () => void
}

export function PolicyCard({ policy, onClick }: PolicyCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">Policy #{policy.policy_id.toString()}</CardTitle>
            <CardDescription className="text-xs mt-1">Land ID: {policy.land_id.toString()}</CardDescription>
          </div>
          <StatusBadge status={policy.status} labels={STATUS_LABELS} colors={STATUS_COLORS} />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <span>{policy.sum_insured.toString()} APT Coverage</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="truncate">{formatAddress(policy.insured)}</span>
        </div>
        <div className="text-xs text-muted-foreground pt-2 border-t">Premium: {policy.premium.toString()} APT</div>
      </CardContent>
    </Card>
  )
}
