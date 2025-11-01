"use client"

// Card component for displaying insurance claims

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { formatAddress } from "@/lib/transaction-utils"
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/aptos-config"
import type { Claim } from "@/types/aptos"
import { FileText, AlertCircle } from "lucide-react"

interface ClaimCardProps {
  claim: Claim
  onClick?: () => void
}

export function ClaimCard({ claim, onClick }: ClaimCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">Claim #{claim.claim_id.toString()}</CardTitle>
            <CardDescription className="text-xs mt-1">{formatAddress(claim.claimant)}</CardDescription>
          </div>
          <StatusBadge status={claim.status} labels={STATUS_LABELS} colors={STATUS_COLORS} />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-start gap-2 text-sm">
          <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <span className="line-clamp-2">{claim.reason}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="truncate font-mono text-xs">{claim.evidence_cid.slice(0, 16)}...</span>
        </div>
        <div className="text-xs text-muted-foreground pt-2 border-t">Policy ID: {claim.policy_id.toString()}</div>
      </CardContent>
    </Card>
  )
}
