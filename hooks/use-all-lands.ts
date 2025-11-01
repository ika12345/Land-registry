// Hook for fetching all land parcels

"use client"

import { useState, useEffect } from "react"
import type { LandParcel } from "@/types/aptos"

interface UseAllLandsResult {
  lands: LandParcel[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useAllLands(): UseAllLandsResult {
  const [lands, setLands] = useState<LandParcel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLands = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Attempt to use a global Aptos client if available (injected by wallet provider)
      // Caller can also call refetch and pass a client directly in future variations
      const client = (globalThis as any).aptosClient

      if (!client || typeof client.view !== "function") {
        console.warn("No Aptos client available — returning empty list (mock)")
        await new Promise((resolve) => setTimeout(resolve, 300))
        setLands([])
        return
      }

      const { fetchAllLands } = await import("@/lib/views")
      const result = await fetchAllLands(client)
      setLands(result || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch lands"
      setError(errorMessage)
      console.error("[v0] Error fetching lands:", errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLands()
  }, [])

  return { lands, isLoading, error, refetch: fetchLands }
}
