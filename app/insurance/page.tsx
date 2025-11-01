"use client"

// Insurance Management page - tabs for policies and claims

import { useState } from "react"
import { usePolicies } from "@/hooks/use-policies"
import { useClaims } from "@/hooks/use-claims"
import { useUserRole } from "@/hooks/use-user-role"
import { useAptosAccount } from "@/hooks/use-aptos-account"
import { PolicyCard } from "@/components/policy-card"
import { ClaimCard } from "@/components/claim-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"

export default function InsuranceManagementPage() {
  const router = useRouter()
  const { address } = useAptosAccount()
  const { role } = useUserRole(address)
  const { policies, isLoading: policiesLoading, error: policiesError } = usePolicies()
  const { claims, isLoading: claimsLoading, error: claimsError } = useClaims()
  const [activeTab, setActiveTab] = useState("policies")

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Insurance Management</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage policies and claims</p>
            </div>
            {role === "INSURER" && activeTab === "policies" && (
              <Link href="/insurance/policy/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Policy
                </Button>
              </Link>
            )}
            {activeTab === "claims" && (
              <Link href="/insurance/claim/submit">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Submit Claim
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="policies">Policies ({policies.length})</TabsTrigger>
            <TabsTrigger value="claims">Claims ({claims.length})</TabsTrigger>
          </TabsList>

          {/* Policies Tab */}
          <TabsContent value="policies" className="space-y-4">
            {policiesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner className="h-8 w-8" />
              </div>
            ) : policiesError ? (
              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="text-destructive">Error Loading Policies</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{policiesError}</p>
                </CardContent>
              </Card>
            ) : policies.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No Policies</CardTitle>
                  <CardDescription>No insurance policies found. Create one to get started.</CardDescription>
                </CardHeader>
                {role === "INSURER" && (
                  <CardContent>
                    <Link href="/insurance/policy/create">
                      <Button>Create First Policy</Button>
                    </Link>
                  </CardContent>
                )}
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {policies.map((policy) => (
                  <div
                    key={policy.policy_id.toString()}
                    onClick={() => router.push(`/insurance/policy/${policy.policy_id}`)}
                    className="cursor-pointer"
                  >
                    <PolicyCard policy={policy} />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Claims Tab */}
          <TabsContent value="claims" className="space-y-4">
            {claimsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner className="h-8 w-8" />
              </div>
            ) : claimsError ? (
              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="text-destructive">Error Loading Claims</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{claimsError}</p>
                </CardContent>
              </Card>
            ) : claims.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No Claims</CardTitle>
                  <CardDescription>No insurance claims submitted yet.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/insurance/claim/submit">
                    <Button>Submit First Claim</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {claims.map((claim) => (
                  <div
                    key={claim.claim_id.toString()}
                    onClick={() => router.push(`/insurance/claim/${claim.claim_id}`)}
                    className="cursor-pointer"
                  >
                    <ClaimCard claim={claim} />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
