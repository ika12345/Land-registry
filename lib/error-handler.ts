// Error handling utilities for Aptos transactions and API calls

export type AptosErrorType =
  | "TRANSACTION_FAILED"
  | "INSUFFICIENT_FUNDS"
  | "UNAUTHORIZED"
  | "INVALID_INPUT"
  | "NETWORK_ERROR"
  | "UNKNOWN"

export interface AptosError extends Error {
  type: AptosErrorType
  code?: number
  details?: string
}

export function parseAptosError(error: any): { type: AptosErrorType; message: string; details?: string } {
  if (!error) {
    return {
      type: "UNKNOWN",
      message: "Unknown error occurred",
    }
  }

  // Handle string errors
  if (typeof error === "string") {
    if (error.includes("insufficient balance") || error.includes("not enough balance")) {
      return {
        type: "INSUFFICIENT_FUNDS",
        message: "Insufficient funds for this transaction",
      }
    }
    if (error.includes("unauthorized") || error.includes("permission")) {
      return {
        type: "UNAUTHORIZED",
        message: "You don't have permission to perform this action",
      }
    }
    return {
      type: "UNKNOWN",
      message: error,
    }
  }

  // Handle Error objects
  if (error instanceof Error) {
    const msg = error.message
    if (msg.includes("insufficient balance")) {
      return {
        type: "INSUFFICIENT_FUNDS",
        message: "Insufficient funds for this transaction",
      }
    }
    if (msg.includes("unauthorized") || msg.includes("permission")) {
      return {
        type: "UNAUTHORIZED",
        message: "You don't have permission to perform this action",
      }
    }
    if (msg.includes("network")) {
      return {
        type: "NETWORK_ERROR",
        message: "Network connection error. Please try again.",
      }
    }
    if (msg.includes("invalid") || msg.includes("validation")) {
      return {
        type: "INVALID_INPUT",
        message: "Invalid input. Please check your data.",
      }
    }
    return {
      type: "TRANSACTION_FAILED",
      message: msg,
    }
  }

  // Handle object errors
  if (error.message) {
    return parseAptosError(error.message)
  }

  return {
    type: "UNKNOWN",
    message: "An unknown error occurred",
  }
}

export function getErrorMessage(error: any): string {
  if (typeof error === "string") return error
  if (error instanceof Error) return error.message
  if (error?.message) return error.message
  return "An unknown error occurred. Please try again."
}

export function getErrorDetails(error: any): string | undefined {
  if (error?.details) return error.details
  if (error?.code) return `Error code: ${error.code}`
  return undefined
}

export const ERROR_RETRY_CONFIG: Record<AptosErrorType, boolean> = {
  TRANSACTION_FAILED: true,
  INSUFFICIENT_FUNDS: false,
  UNAUTHORIZED: false,
  INVALID_INPUT: false,
  NETWORK_ERROR: true,
  UNKNOWN: true,
}

export const USER_FRIENDLY_MESSAGES: Record<AptosErrorType, string> = {
  TRANSACTION_FAILED:
    "The transaction failed. Please check your inputs and try again. If the problem persists, please contact support.",
  INSUFFICIENT_FUNDS: "You don't have enough funds to complete this transaction. Please check your wallet balance.",
  UNAUTHORIZED: "You don't have permission to perform this action. Please verify your role and permissions.",
  INVALID_INPUT: "The input data is invalid. Please check your form and try again.",
  NETWORK_ERROR: "There's a network connection issue. Please check your internet connection and try again.",
  UNKNOWN: "An unexpected error occurred. Please try again or contact support if the problem persists.",
}

export function shouldRetryOnError(error: AptosError): boolean {
  return ERROR_RETRY_CONFIG[error.type] ?? false
}

export function getUserFriendlyMessage(error: AptosError): string {
  return USER_FRIENDLY_MESSAGES[error.type] ?? "An unknown error occurred. Please try again."
}
