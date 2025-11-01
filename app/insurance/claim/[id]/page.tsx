"use client"

// Claim detail page

import { useParams } from "next/navigation"
import { useClaims } from "@/hooks/use-claims"
import { useUserRole } from "@/hooks/use-user-role"
import { useAptosAccount } from "@/hooks/use-aptos-account"
import { StatusBadge } from "@/components/status-badge"
import { MetadataViewer } from "@/components/metadata-viewer"
import { TransactionButton } from "@/components/transaction-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/aptos-config"
import { formatAddress } from "@/lib/transaction-utils"
import Link from "next/link"
import { ArrowLeft, FileText, Calendar, User, AlertCircle } from "lucide-react"

export default function ClaimDetailPage() {
  const params = useParams()
  const claimId = params?.id as string
  const { address } = useAptosAccount()
  const { role } = useUserRole(address)
  const { claims, isLoading } = useClaims()
  const claim = claims.find((c) => c.claim_id.toString() === claimId)

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Spinner className="h-8 w-8" />
      </main>
    )
  }

  if (!claim) {
    return (
      <main className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/insurance" className="flex items-center gap-2 text-sm hover:underline w-fit">
              <ArrowLeft className="h-4 w-4" />
              Back to Insurance
            </Link>
          </div>
        </header>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Claim Not Found</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </main>
    )
  }

  const canReview = (role === "TEHSILDAR" || role === "DLR") && claim.status === 1 // PENDING

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/insurance" className="flex items-center gap-2 text-sm hover:underline w-fit mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Insurance
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">Claim #{claim.claim_id.toString()}</h1>
              <p className="text-sm text-muted-foreground mt-1">Policy #{claim.policy_id.toString()}</p>
            </div>
            <StatusBadge status={claim.status} labels={STATUS_LABELS} colors={STATUS_COLORS} />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Claim Details */}
        <Card>
          <CardHeader>
            <CardTitle>Claim Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Claimant
                </p>
                <p className="font-mono text-sm">{formatAddress(claim.claimant)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Submitted
                </p>
                <p className="text-sm">{new Date(Date.now()).toLocaleDateString()}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4" />
                Reason
              </p>
              <Alert>
                <AlertDescription className="text-base">{claim.reason}</AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        {/* Evidence */}
        <Card>
          <CardHeader>
            <CardTitle>Evidence</CardTitle>
            <CardDescription>Documents and files submitted for this claim</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Claim Evidence</p>
                  <p className="text-xs text-muted-foreground">{claim.evidence_cid.slice(0, 20)}...</p>
                </div>
              </div>
              <MetadataViewer cid={claim.evidence_cid} label="View" type="document" />
            </div>
          </CardContent>
        </Card>

        {/* Decision Info (if decided) */}
        {claim.status !== 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Decision</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Decided By</p>
                <p className="font-mono text-sm">{formatAddress(claim.decided_by)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Decision Date</p>
                <p className="text-sm">{new Date(Number(claim.decided_ts) * 1000).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Review Actions */}
        {canReview && (
          <Card>
            <CardHeader>
              <CardTitle>Review Claim</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <TransactionButton
                onTransaction={async () => {
                  // TODO: Call verify_claim with approved status
                  console.log("[v0] Approving claim:", claimId)
                }}
                loadingText="Approving..."
                className="flex-1"
              >
                Approve Claim
              </TransactionButton>
              <TransactionButton
                onTransaction={async () => {
                  // TODO: Call verify_claim with rejected status
                  console.log("[v0] Rejecting claim:", claimId)
                }}
                loadingText="Rejecting..."
                variant="destructive"
                className="flex-1"
              >
                Reject Claim
              </TransactionButton>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
