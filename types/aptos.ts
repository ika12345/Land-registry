// Type definitions for Aptos smart contracts

export interface LandParcel {
  land_id: bigint
  owner_wallet: string
  coordinates_cid: string
  document_cid: string
  area_sq_meters: bigint
  status: number // 1=PROVISIONAL, 2=APPROVED, 3=FINALIZED, 99=DISPUTED
  last_verified_by: string
  last_updated_timestamp: bigint
}

export interface Policy {
  policy_id: bigint
  land_id: bigint
  insurer: string
  insured: string
  sum_insured: bigint
  premium: bigint
  status: number // 1=ACTIVE, 9=CANCELLED
  created_ts: bigint
}

export interface Claim {
  claim_id: bigint
  policy_id: bigint
  claimant: string
  reason: string
  evidence_cid: string
  status: number // 1=PENDING, 2=APPROVED, 3=REJECTED, 4=PAID
  decided_by: string
  decided_ts: bigint
}

export type UserRole = "PATWARI" | "TEHSILDAR" | "DLR" | "OWNER" | "INSURER" | null

export interface UserStats {
  landsOwned: number
  activePolicies: number
  pendingClaims: number
  finalizedLands: number
}

export interface TransactionResult {
  hash: string
  success: boolean
  error?: string
}
