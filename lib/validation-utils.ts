// Validation utilities for land registry forms and transactions

export interface ValidationResult {
  valid: boolean
  errors: Record<string, string>
}

export function validateLandRegistration(data: {
  area?: string
  coordinates?: string
  documents?: string
}): ValidationResult {
  const errors: Record<string, string> = {}

  if (!data.area || Number.parseFloat(data.area) <= 0) {
    errors.area = "Area must be a positive number"
  }

  if (!data.coordinates || data.coordinates.trim().length === 0) {
    errors.coordinates = "Coordinates are required"
  }

  if (!data.documents || data.documents.trim().length === 0) {
    errors.documents = "At least one document must be uploaded"
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

export function validatePolicyCreation(data: {
  landId?: string
  sumInsured?: string
  premium?: string
}): ValidationResult {
  const errors: Record<string, string> = {}

  if (!data.landId || data.landId.trim().length === 0) {
    errors.landId = "Land selection is required"
  }

  if (!data.sumInsured || Number.parseFloat(data.sumInsured) <= 0) {
    errors.sumInsured = "Sum insured must be a positive number"
  }

  if (!data.premium || Number.parseFloat(data.premium) <= 0) {
    errors.premium = "Premium must be a positive number"
  }

  const premium = Number.parseFloat(data.premium)
  const sumInsured = Number.parseFloat(data.sumInsured)
  if (premium >= sumInsured) {
    errors.premium = "Premium must be less than sum insured"
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

export function validateClaimSubmission(data: {
  policyId?: string
  reason?: string
  evidence?: string
}): ValidationResult {
  const errors: Record<string, string> = {}

  if (!data.policyId || data.policyId.trim().length === 0) {
    errors.policyId = "Policy selection is required"
  }

  if (!data.reason || data.reason.trim().length === 0) {
    errors.reason = "Claim reason is required"
  }

  if (data.reason && data.reason.length < 10) {
    errors.reason = "Claim reason must be at least 10 characters"
  }

  if (!data.evidence || data.evidence.trim().length === 0) {
    errors.evidence = "At least one evidence document must be uploaded"
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

export function validateAddress(address: string): boolean {
  // Basic Aptos address validation - 0x followed by hex characters
  return /^0x[0-9a-fA-F]+$/.test(address)
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhoneNumber(phone: string): boolean {
  // Basic phone validation - at least 10 digits
  const phoneDigits = phone.replace(/\D/g, "")
  return phoneDigits.length >= 10
}
