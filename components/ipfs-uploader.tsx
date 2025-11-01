// Component for uploading files to IPFS

"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Upload } from "lucide-react"

interface IPFSUploaderProps {
  onUploadComplete: (cid: string) => void
  onError?: (error: string) => void
  acceptedFormats?: string
  maxSize?: number // in MB
}

export function IPFSUploader({
  onUploadComplete,
  onError,
  acceptedFormats = ".pdf,.jpg,.jpeg,.png,.json",
  maxSize = 10,
}: IPFSUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [fileName, setFileName] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    try {
      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        throw new Error(`File size exceeds ${maxSize}MB limit`)
      }

      setIsUploading(true)
      setFileName(file.name)

      // TODO: Replace with actual nft.storage upload
      console.log("[v0] Uploading file to IPFS:", file.name)

      // Mock upload for demonstration
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const mockCid = "QmMockCID" + Math.random().toString(36).substr(2, 9)

      onUploadComplete(mockCid)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed"
      console.error("[v0] IPFS upload error:", errorMessage)
      onError?.(errorMessage)
      setFileName("")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats}
        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        disabled={isUploading}
        className="hidden"
      />
      <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading} variant="outline" size="sm">
        {isUploading ? (
          <>
            <Spinner className="mr-2 h-4 w-4" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            {fileName || "Upload File"}
          </>
        )}
      </Button>
    </div>
  )
}
