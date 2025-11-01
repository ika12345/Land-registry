"use client"

// Land registration page - Patwari only

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAptosAccount } from "@/hooks/use-aptos-account"
import { useUserRole } from "@/hooks/use-user-role"
import { TransactionButton } from "@/components/transaction-button"
import { IPFSUploader } from "@/components/ipfs-uploader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function RegisterLandPage() {
  const router = useRouter()
  const { address } = useAptosAccount()
  const { role } = useUserRole(address)
  const [ownerAddress, setOwnerAddress] = useState("")
  const [area, setArea] = useState("")
  const [coordinatesCid, setCoordinatesCid] = useState("")
  const [documentCid, setDocumentCid] = useState("")
  const [error, setError] = useState<string | null>(null)

  // Check role authorization
  if (role !== "PATWARI") {
    return (
      <main className="min-h-screen bg-background">
        <header className="border-b bg-card sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/land" className="flex items-center gap-2 text-sm hover:underline w-fit mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Lands
            </Link>
          </div>
        </header>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert className="border-destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-destructive">
              Only Patwari users can register new land parcels
            </AlertDescription>
          </Alert>
        </div>
      </main>
    )
  }

  const handleRegisterLand = async () => {
    // Validate form
    if (!ownerAddress || !area || !coordinatesCid || !documentCid) {
      setError("Please fill in all fields and upload documents")
      return
    }

    try {
      setError(null)

      // TODO: Replace with actual Aptos transaction
      const payload = {
        type: "entry_function_payload",
        function: `${process.env.NEXT_PUBLIC_APTOS_MODULE_ADDRESS}::landregistry::register_land`,
        type_arguments: [],
        arguments: [ownerAddress, coordinatesCid, documentCid, BigInt(area)],
      }

      console.log("[v0] Registering land with payload:", payload)

      // Mock transaction for demonstration
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Success - redirect to land details
      router.push("/land")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Registration failed"
      setError(errorMessage)
      console.error("[v0] Registration error:", errorMessage)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/land" className="flex items-center gap-2 text-sm hover:underline w-fit mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Lands
          </Link>
          <h1 className="text-2xl font-bold">Register New Land</h1>
          <p className="text-sm text-muted-foreground mt-1">Create a new land parcel record on the blockchain</p>
        </div>
      </header>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Land Registration Form</CardTitle>
            <CardDescription>Fill in the details to register a new land parcel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Owner Address */}
            <div className="space-y-2">
              <label htmlFor="owner" className="text-sm font-medium">
                Owner Wallet Address
              </label>
              <Input
                id="owner"
                placeholder="0x1234567890abcdef..."
                value={ownerAddress}
                onChange={(e) => setOwnerAddress(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Address of the land owner</p>
            </div>

            {/* Area */}
            <div className="space-y-2">
              <label htmlFor="area" className="text-sm font-medium">
                Area (Square Meters)
              </label>
              <Input
                id="area"
                type="number"
                placeholder="5000"
                value={area}
                onChange={(e) => setArea(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Total area in square meters</p>
            </div>

            {/* Geolocation Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Upload Geolocation File (GeoJSON)</label>
              <IPFSUploader
                acceptedFormats=".json,.geojson"
                onUploadComplete={(cid) => {
                  setCoordinatesCid(cid)
                  setError(null)
                }}
                onError={(err) => setError(err)}
              />
              {coordinatesCid && <p className="text-xs text-green-600">Uploaded: {coordinatesCid.slice(0, 20)}...</p>}
            </div>

            {/* Document Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Upload Document (PDF/Image)</label>
              <IPFSUploader
                acceptedFormats=".pdf,.jpg,.jpeg,.png"
                onUploadComplete={(cid) => {
                  setDocumentCid(cid)
                  setError(null)
                }}
                onError={(err) => setError(err)}
              />
              {documentCid && <p className="text-xs text-green-600">Uploaded: {documentCid.slice(0, 20)}...</p>}
            </div>

            {/* Error Message */}
            {error && (
              <Alert className="border-destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-destructive">{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <div className="flex gap-2 pt-4">
              <TransactionButton
                onTransaction={handleRegisterLand}
                loadingText="Registering..."
                successText="Land registered successfully!"
                className="flex-1"
              >
                Register Land
              </TransactionButton>
              <Link href="/land">
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
