// Utility functions for Aptos transactions

import type { TransactionResult } from "@/types/aptos"
import { APTOS_CONFIG } from "./aptos-config"
import { parseAptosError } from "./error-handler"

export async function submitTransaction(
  payload: any,
  signAndSubmitTransaction: (payload: any) => Promise<any>,
  onSuccess?: (hash: string) => void,
  onError?: (error: string) => void,
): Promise<TransactionResult> {
  try {
    console.log("[v0] Submitting transaction:", payload)
    const result = await signAndSubmitTransaction(payload)

    if (result && result.hash) {
      console.log("[v0] Transaction submitted with hash:", result.hash)
      onSuccess?.(result.hash)
      return { hash: result.hash, success: true }
    }

    throw new Error("No transaction hash received")
  } catch (error) {
    const parsedError = parseAptosError(error)
    const errorMessage = parsedError.message
    console.error("[v0] Transaction error:", errorMessage)
    onError?.(errorMessage)
    return { hash: "", success: false, error: errorMessage }
  }
}

export async function submitTransactionWithRetry(
  payload: any,
  signAndSubmitTransaction: (payload: any) => Promise<any>,
  options: {
    maxRetries?: number
    retryDelay?: number
    onSuccess?: (hash: string) => void
    onError?: (error: string) => void
  } = {},
): Promise<TransactionResult> {
  const { maxRetries = 3, retryDelay = 1000 } = options
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`[v0] Transaction attempt ${attempt + 1}/${maxRetries}`)
      const result = await submitTransaction(payload, signAndSubmitTransaction, options.onSuccess, options.onError)

      if (result.success) {
        return result
      }

      lastError = new Error(result.error)

      // Don't retry on permission or validation errors
      if (
        result.error?.includes("permission") ||
        result.error?.includes("Invalid") ||
        result.error?.includes("validation")
      ) {
        break
      }

      if (attempt < maxRetries - 1) {
        console.log(`[v0] Retrying in ${retryDelay}ms...`)
        await new Promise((resolve) => setTimeout(resolve, retryDelay))
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
    }
  }

  const errorMessage = lastError?.message || "Transaction failed after retries"
  options.onError?.(errorMessage)
  return { hash: "", success: false, error: errorMessage }
}

export interface TransactionHistoryEntry {
  hash: string
  type: "land_registration" | "policy_creation" | "claim_submission" | "land_approval" | "land_finalize"
  timestamp: number
  status: "pending" | "success" | "failed"
  details?: Record<string, any>
}

export function saveTransactionHistory(entry: TransactionHistoryEntry): void {
  try {
    const history = getTransactionHistory()
    history.unshift(entry)
    // Keep last 50 transactions
    const trimmed = history.slice(0, 50)
    localStorage.setItem("transaction_history", JSON.stringify(trimmed))
  } catch (error) {
    console.error("[v0] Failed to save transaction history:", error)
  }
}

export function getTransactionHistory(): TransactionHistoryEntry[] {
  try {
    const history = localStorage.getItem("transaction_history")
    return history ? JSON.parse(history) : []
  } catch (error) {
    console.error("[v0] Failed to load transaction history:", error)
    return []
  }
}

export function clearTransactionHistory(): void {
  try {
    localStorage.removeItem("transaction_history")
  } catch (error) {
    console.error("[v0] Failed to clear transaction history:", error)
  }
}

export function getIpfsUrl(cid: string): string {
  return `${APTOS_CONFIG.IPFS_GATEWAY}${cid}`
}

export function formatAddress(address: string): string {
  if (!address) return ""
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function getRoleLabel(role: number | null): string {
  const roleLabels: { [key: number]: string } = {
    1: "Patwari",
    2: "Tehsildar",
    3: "DLR",
  }
  return roleLabels[role || 0] || "User"
}

export function validateTransactionPayload(payload: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!payload) {
    errors.push("Transaction payload is required")
    return { valid: false, errors }
  }

  if (!payload.type) {
    errors.push("Transaction type is required")
  }

  if (!payload.arguments || !Array.isArray(payload.arguments)) {
    errors.push("Transaction arguments must be an array")
  }

  return { valid: errors.length === 0, errors }
}

export function formatTimestamp(timestamp: number | bigint): string {
  try {
    const ms = typeof timestamp === "bigint" ? Number(timestamp) : timestamp
    return new Date(ms).toLocaleString()
  } catch {
    return "Invalid date"
  }
}

export function formatBigInt(value: bigint): string {
  return value.toString()
}

export function formatOctas(octas: bigint): string {
  // Convert octas to APT (1 APT = 10^8 octas)
  const apt = Number(octas) / 100000000
  return apt.toFixed(6)
}
