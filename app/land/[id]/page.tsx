"use client"

// Land detail page

import { useParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { useLandDetails } from "@/hooks/use-land-details"
import { useUserRole } from "@/hooks/use-user-role"
import { useAptosAccount } from "@/hooks/use-aptos-account"
import { usePolicies } from "@/hooks/use-policies"
import { StatusBadge } from "@/components/status-badge"
import { MetadataViewer } from "@/components/metadata-viewer"
import { PolicyCard } from "@/components/policy-card"
import { TransactionButton } from "@/components/transaction-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/aptos-config"
import { formatAddress } from "@/lib/transaction-utils"
import Link from "next/link"
import { ArrowLeft, MapPin, Ruler, Calendar, FileText } from "lucide-react"

export default function LandDetailPage() {
  const router = useRouter()
  const params = useParams()
  const landId = params?.id as string
  const { address } = useAptosAccount()
  const { role } = useUserRole(address)
  const { land, isLoading, error } = useLandDetails(landId)
  const { policies } = usePolicies()

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Spinner className="h-8 w-8" />
      </main>
    )
  }

  if (error || !land) {
    return (
      <main className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/land" className="flex items-center gap-2 text-sm hover:underline w-fit">
              <ArrowLeft className="h-4 w-4" />
              Back to Lands
            </Link>
          </div>
        </header>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Error Loading Land</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{error || "Land not found"}</p>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  const relatedPolicies = policies.filter((p) => p.land_id === land.land_id)
  const isOwner = address?.toLowerCase() === land.owner_wallet.toLowerCase()
  const canApprove = role === "TEHSILDAR" && land.status === 1 // PROVISIONAL
  const canFinalize = role === "DLR" && land.status === 2 // APPROVED

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/land" className="flex items-center gap-2 text-sm hover:underline w-fit mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Lands
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">Land #{land.land_id.toString()}</h1>
              <p className="text-sm text-muted-foreground mt-1">{formatAddress(land.owner_wallet)}</p>
            </div>
            <StatusBadge status={land.status} labels={STATUS_LABELS} colors={STATUS_COLORS} />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="insurance">Insurance ({relatedPolicies.length})</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Land Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Owner</p>
                    <p className="font-mono text-sm">{formatAddress(land.owner_wallet)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Area</p>
                    <p className="font-mono text-sm flex items-center gap-2">
                      <Ruler className="h-4 w-4" />
                      {land.area_sq_meters.toString()} sq meters
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="text-sm mt-1">{STATUS_LABELS[land.status]}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Verified By</p>
                    <p className="font-mono text-sm">{formatAddress(land.last_verified_by)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p className="text-sm flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(Number(land.last_updated_timestamp) * 1000).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Role-based Actions */}
            {(canApprove || canFinalize || isOwner) && (
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {canApprove && (
                    <TransactionButton
                      onTransaction={async () => {
                        // TODO: Call approve_land transaction
                        console.log("[v0] Approving land:", landId)
                      }}
                      loadingText="Approving..."
                    >
                      Approve Land
                    </TransactionButton>
                  )}
                  {canFinalize && (
                    <TransactionButton
                      onTransaction={async () => {
                        // TODO: Call finalize_land transaction
                        console.log("[v0] Finalizing land:", landId)
                      }}
                      loadingText="Finalizing..."
                    >
                      Finalize Land
                    </TransactionButton>
                  )}
                  {isOwner && land.status === 3 && (
                    <Link href={`/land/transfer/${landId}`}>
                      <Button>Transfer Ownership</Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Land Documents</CardTitle>
                <CardDescription>View attached GeoJSON and documentation files</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Geolocation Data</p>
                      <p className="text-xs text-muted-foreground">{land.coordinates_cid.slice(0, 20)}...</p>
                    </div>
                  </div>
                  <MetadataViewer cid={land.coordinates_cid} type="geojson" />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Land Document</p>
                      <p className="text-xs text-muted-foreground">{land.document_cid.slice(0, 20)}...</p>
                    </div>
                  </div>
                  <MetadataViewer cid={land.document_cid} type="document" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insurance Tab */}
          <TabsContent value="insurance" className="space-y-4">
            {relatedPolicies.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No Policies</CardTitle>
                  <CardDescription>No insurance policies attached to this land yet</CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {relatedPolicies.map((policy) => (
                  <div
                    key={policy.policy_id.toString()}
                    onClick={() => router.push(`/insurance/policy/${policy.policy_id}`)}
                  >
                    <PolicyCard policy={policy} />
                  </div>
                ))}
              </div>
            )}
            {land.status === 3 && (
              <Link href={`/insurance/policy/create?landId=${land.land_id}`}>
                <Button className="w-full">Create Insurance Policy</Button>
              </Link>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
