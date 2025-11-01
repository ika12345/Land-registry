"use client"

// Component for viewing IPFS metadata

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { getIpfsUrl } from "@/lib/transaction-utils"
import { ExternalLink } from "lucide-react"

interface MetadataViewerProps {
  cid: string
  label?: string
  type?: "document" | "geojson"
}

export function MetadataViewer({ cid, label = "View", type = "document" }: MetadataViewerProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleView = () => {
    setIsLoading(true)
    const url = getIpfsUrl(cid)
    window.open(url, "_blank")
    setIsLoading(false)
  }

  return (
    <Button onClick={handleView} disabled={isLoading} variant="outline" size="sm">
      <ExternalLink className="h-4 w-4 mr-2" />
      {label} ({type})
    </Button>
  )
}
