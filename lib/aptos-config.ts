// Aptos configuration and constants

export const APTOS_CONFIG = {
  // Replace with your actual module address
  MODULE_ADDRESS: process.env.NEXT_PUBLIC_APTOS_MODULE_ADDRESS || "0x1",
  NETWORK: (process.env.NEXT_PUBLIC_APTOS_NETWORK || "devnet") as "devnet" | "testnet" | "mainnet",
  IPFS_GATEWAY: "https://gateway.pinata.cloud/ipfs/",
}

export const ROLES = {
  PATWARI: 1,
  TEHSILDAR: 2,
  DLR: 3,
}

export const LAND_STATUS = {
  PROVISIONAL: 1,
  APPROVED: 2,
  FINALIZED: 3,
  DISPUTED: 99,
}

export const POLICY_STATUS = {
  ACTIVE: 1,
  CANCELLED: 9,
}

export const CLAIM_STATUS = {
  PENDING: 1,
  APPROVED: 2,
  REJECTED: 3,
  PAID: 4,
}

export const STATUS_LABELS = {
  [LAND_STATUS.PROVISIONAL]: "Provisional",
  [LAND_STATUS.APPROVED]: "Approved",
  [LAND_STATUS.FINALIZED]: "Finalized",
  [LAND_STATUS.DISPUTED]: "Disputed",
  [POLICY_STATUS.ACTIVE]: "Active",
  [POLICY_STATUS.CANCELLED]: "Cancelled",
  [CLAIM_STATUS.PENDING]: "Pending",
  [CLAIM_STATUS.APPROVED]: "Approved",
  [CLAIM_STATUS.REJECTED]: "Rejected",
  [CLAIM_STATUS.PAID]: "Paid",
}

export const STATUS_COLORS = {
  [LAND_STATUS.PROVISIONAL]: "bg-blue-100 text-blue-800",
  [LAND_STATUS.APPROVED]: "bg-green-100 text-green-800",
  [LAND_STATUS.FINALIZED]: "bg-purple-100 text-purple-800",
  [LAND_STATUS.DISPUTED]: "bg-red-100 text-red-800",
  [POLICY_STATUS.ACTIVE]: "bg-green-100 text-green-800",
  [POLICY_STATUS.CANCELLED]: "bg-gray-100 text-gray-800",
  [CLAIM_STATUS.PENDING]: "bg-yellow-100 text-yellow-800",
  [CLAIM_STATUS.APPROVED]: "bg-green-100 text-green-800",
  [CLAIM_STATUS.REJECTED]: "bg-red-100 text-red-800",
  [CLAIM_STATUS.PAID]: "bg-emerald-100 text-emerald-800",
}
