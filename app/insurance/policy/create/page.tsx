"use client"

// Create insurance policy page

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAptosAccount } from "@/hooks/use-aptos-account"
import { useUserRole } from "@/hooks/use-user-role"
import { useAllLands } from "@/hooks/use-all-lands"
import { TransactionButton } from "@/components/transaction-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { ArrowLeft, AlertCircle } from "lucide-react"

export default function CreatePolicyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { address } = useAptosAccount()
  const { role } = useUserRole(address)
  const { lands } = useAllLands()

  const [landId, setLandId] = useState(searchParams.get("landId") || "")
  const [insuredAddress, setInsuredAddress] = useState("")
  const [sumInsured, setSumInsured] = useState("")
  const [premium, setPremium] = useState("")
  const [error, setError] = useState<string | null>(null)

  // Filter only finalized lands
  const availableLands = lands.filter((land) => land.status === 3)

  if (role !== "INSURER") {
    return (
      <main className="min-h-screen bg-background">
        <header className="border-b bg-card sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/insurance" className="flex items-center gap-2 text-sm hover:underline w-fit mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Insurance
            </Link>
          </div>
        </header>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert className="border-destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-destructive">Only insurers can create policies</AlertDescription>
          </Alert>
        </div>
      </main>
    )
  }

  const handleCreatePolicy = async () => {
    if (!landId || !insuredAddress || !sumInsured || !premium) {
      setError("Please fill in all fields")
      return
    }

    try {
      setError(null)

      // TODO: Replace with actual Aptos transaction
      const payload = {
        type: "entry_function_payload",
        function: `${process.env.NEXT_PUBLIC_APTOS_MODULE_ADDRESS}::insurance::create_policy`,
        type_arguments: [],
        arguments: [BigInt(landId), insuredAddress, BigInt(sumInsured), BigInt(premium)],
      }

      console.log("[v0] Creating policy with payload:", payload)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      router.push("/insurance")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Policy creation failed"
      setError(errorMessage)
      console.error("[v0] Policy creation error:", errorMessage)
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
          <h1 className="text-2xl font-bold">Create Insurance Policy</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create a new insurance policy for a finalized land parcel
          </p>
        </div>
      </header>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Policy Details</CardTitle>
            <CardDescription>Fill in the insurance policy information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Land Selection */}
            <div className="space-y-2">
              <label htmlFor="land" className="text-sm font-medium">
                Select Finalized Land
              </label>
              <Select value={landId} onValueChange={(value) => setLandId(value)}>
                <SelectTrigger id="land">
                  <SelectValue placeholder="Choose a finalized land..." />
                </SelectTrigger>
                <SelectContent>
                  {availableLands.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No finalized lands available
                    </SelectItem>
                  ) : (
                    availableLands.map((land) => (
                      <SelectItem key={land.land_id.toString()} value={land.land_id.toString()}>
                        Land #{land.land_id.toString()} - {land.area_sq_meters.toString()} sq m
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Only finalized lands can have insurance</p>
            </div>

            {/* Insured Address */}
            <div className="space-y-2">
              <label htmlFor="insured" className="text-sm font-medium">
                Insured Address
              </label>
              <Input
                id="insured"
                placeholder="0x1234567890abcdef..."
                value={insuredAddress}
                onChange={(e) => setInsuredAddress(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Address of the insured party</p>
            </div>

            {/* Sum Insured */}
            <div className="space-y-2">
              <label htmlFor="sum" className="text-sm font-medium">
                Sum Insured (APT)
              </label>
              <Input
                id="sum"
                type="number"
                placeholder="1000"
                value={sumInsured}
                onChange={(e) => setSumInsured(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Coverage amount in APT</p>
            </div>

            {/* Premium */}
            <div className="space-y-2">
              <label htmlFor="premium" className="text-sm font-medium">
                Premium (APT)
              </label>
              <Input
                id="premium"
                type="number"
                placeholder="50"
                value={premium}
                onChange={(e) => setPremium(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Insurance premium in APT</p>
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
                onTransaction={handleCreatePolicy}
                loadingText="Creating..."
                successText="Policy created!"
                className="flex-1"
              >
                Create Policy
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
