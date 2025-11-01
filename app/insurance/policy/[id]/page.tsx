"use client"

// Policy detail page

import { useParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { usePolicies } from "@/hooks/use-policies"
import { useLandDetails } from "@/hooks/use-land-details"
import { useUserRole } from "@/hooks/use-user-role"
import { useAptosAccount } from "@/hooks/use-aptos-account"
import { StatusBadge } from "@/components/status-badge"
import { TransactionButton } from "@/components/transaction-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/aptos-config"
import { formatAddress } from "@/lib/transaction-utils"
import Link from "next/link"
import { ArrowLeft, Calendar, DollarSign } from "lucide-react"

export default function PolicyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const policyId = params?.id as string
  const { address } = useAptosAccount()
  const { role } = useUserRole(address)
  const { policies, isLoading: policiesLoading } = usePolicies()
  const policy = policies.find((p) => p.policy_id.toString() === policyId)
  const { land, isLoading: landLoading } = useLandDetails(policy?.land_id.toString() || "")

  const isLoading = policiesLoading || landLoading
  const isInsurer = address?.toLowerCase() === policy?.insurer.toLowerCase()
  const isInsured = address?.toLowerCase() === policy?.insured.toLowerCase()

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Spinner className="h-8 w-8" />
      </main>
    )
  }

  if (!policy) {
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
              <CardTitle className="text-destructive">Policy Not Found</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </main>
    )
  }

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
              <h1 className="text-2xl font-bold">Policy #{policy.policy_id.toString()}</h1>
              <p className="text-sm text-muted-foreground mt-1">Land #{policy.land_id.toString()}</p>
            </div>
            <StatusBadge status={policy.status} labels={STATUS_LABELS} colors={STATUS_COLORS} />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Policy Details */}
        <Card>
          <CardHeader>
            <CardTitle>Policy Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Insurer</p>
                <p className="font-mono text-sm">{formatAddress(policy.insurer)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Insured</p>
                <p className="font-mono text-sm">{formatAddress(policy.insured)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Sum Insured
                </p>
                <p className="text-sm font-semibold">{policy.sum_insured.toString()} APT</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Premium</p>
                <p className="text-sm font-semibold">{policy.premium.toString()} APT</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Created
                </p>
                <p className="text-sm">{new Date(Number(policy.created_ts) * 1000).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Land Details */}
        {land && (
          <Card>
            <CardHeader>
              <CardTitle>Insured Land Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Land #{land.land_id.toString()}</p>
                    <p className="text-xs text-muted-foreground">{formatAddress(land.owner_wallet)}</p>
                  </div>
                  <Link href={`/land/${land.land_id}`}>
                    <Button size="sm" variant="outline">
                      View Land
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        {(isInsurer || (isInsured && policy.status === 1)) && (
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isInsured && policy.status === 1 && (
                <Link href={`/insurance/claim/submit?policyId=${policy.policy_id}`}>
                  <Button className="w-full">Submit Claim</Button>
                </Link>
              )}
              {isInsurer && policy.status === 1 && (
                <TransactionButton
                  onTransaction={async () => {
                    // TODO: Call cancel_policy transaction
                    console.log("[v0] Cancelling policy:", policyId)
                  }}
                  loadingText="Cancelling..."
                  variant="destructive"
                  className="w-full"
                >
                  Cancel Policy
                </TransactionButton>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
