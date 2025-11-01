"use client"

// Submit insurance claim page

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAptosAccount } from "@/hooks/use-aptos-account"
import { usePolicies } from "@/hooks/use-policies"
import { TransactionButton } from "@/components/transaction-button"
import { IPFSUploader } from "@/components/ipfs-uploader"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { ArrowLeft, AlertCircle } from "lucide-react"

export default function SubmitClaimPage() {
  const router = useRouter()
  const { address } = useAptosAccount()
  const { policies } = usePolicies()

  const [policyId, setPolicyId] = useState("")
  const [reason, setReason] = useState("")
  const [evidenceCid, setEvidenceCid] = useState("")
  const [error, setError] = useState<string | null>(null)

  // Filter policies for this user
  const userPolicies = policies.filter((p) => p.insured.toLowerCase() === address?.toLowerCase())

  const handleSubmitClaim = async () => {
    if (!policyId || !reason || !evidenceCid) {
      setError("Please fill in all fields and upload evidence")
      return
    }

    try {
      setError(null)

      // TODO: Replace with actual Aptos transaction
      const payload = {
        type: "entry_function_payload",
        function: `${process.env.NEXT_PUBLIC_APTOS_MODULE_ADDRESS}::insurance::submit_claim`,
        type_arguments: [],
        arguments: [BigInt(policyId), reason, evidenceCid],
      }

      console.log("[v0] Submitting claim with payload:", payload)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      router.push("/insurance")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Claim submission failed"
      setError(errorMessage)
      console.error("[v0] Claim submission error:", errorMessage)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/insurance" className="flex items-center gap-2 text-sm hover:underline w-fit mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Insurance
          </Link>
          <h1 className="text-2xl font-bold">Submit Insurance Claim</h1>
          <p className="text-sm text-muted-foreground mt-1">File a new claim against your insurance policy</p>
        </div>
      </header>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Claim Details</CardTitle>
            <CardDescription>Provide information about your claim</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Policy Selection */}
            <div className="space-y-2">
              <label htmlFor="policy" className="text-sm font-medium">
                Select Policy
              </label>
              <Select value={policyId} onValueChange={(value) => setPolicyId(value)}>
                <SelectTrigger id="policy">
                  <SelectValue placeholder="Choose an active policy..." />
                </SelectTrigger>
                <SelectContent>
                  {userPolicies.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No active policies found
                    </SelectItem>
                  ) : (
                    userPolicies
                      .filter((p) => p.status === 1) // ACTIVE
                      .map((policy) => (
                        <SelectItem key={policy.policy_id.toString()} value={policy.policy_id.toString()}>
                          Policy #{policy.policy_id.toString()} - Land #{policy.land_id.toString()}
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">You can only claim on your active policies</p>
            </div>

            {/* Claim Reason */}
            <div className="space-y-2">
              <label htmlFor="reason" className="text-sm font-medium">
                Reason for Claim
              </label>
              <Textarea
                id="reason"
                placeholder="Describe the incident or damage..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">Provide detailed information about the claim</p>
            </div>

            {/* Evidence Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Upload Evidence (Photos/Documents)</label>
              <IPFSUploader
                acceptedFormats=".pdf,.jpg,.jpeg,.png"
                maxSize={10}
                onUploadComplete={(cid) => {
                  setEvidenceCid(cid)
                  setError(null)
                }}
                onError={(err) => setError(err)}
              />
              {evidenceCid && <p className="text-xs text-green-600">Uploaded: {evidenceCid.slice(0, 20)}...</p>}
            </div>

            {/* Error */}
            {error && (
              <Alert className="border-destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-destructive">{error}</AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <TransactionButton
                onTransaction={handleSubmitClaim}
                loadingText="Submitting..."
                successText="Claim submitted!"
                className="flex-1"
              >
                Submit Claim
              </TransactionButton>
              <Link href="/insurance">
                <Button variant="outline" className="w-full bg-transparent">
                  Cancel
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
