// Transaction builders for interacting with Move modules (landregistry and insurance)
import { APTOS_CONFIG } from "./aptos-config"

export type SignerFunc = (payload: any) => Promise<any>

function moduleFn(moduleName: string, fnName: string) {
  return `${APTOS_CONFIG.MODULE_ADDRESS}::${moduleName}::${fnName}`
}

// Generic entry function payload builder - AIP-62 format
export function buildEntryFunctionPayload(functionFullName: string, args: any[] = [], typeArgs: any[] = []) {
  return {
    data: {
      function: functionFullName,
      typeArguments: typeArgs,
      functionArguments: args,
    }
  }
}

// LAND registry transactions
export function buildRegisterLandPayload(ownerAddress: string, coordinatesCid: string, documentCid: string, area: number) {
  // register_land(patwari: &signer, owner_wallet: address, coordinates_cid: String, document_cid: String, area: u64)
  return buildEntryFunctionPayload(
    moduleFn("landregistry", "register_land"),
    [ownerAddress, coordinatesCid, documentCid, String(area)]
  )
}

export function buildApproveLandPayload(landId: number) {
  // approve_land(tehsildar: &signer, land_id: u64)
  return buildEntryFunctionPayload(moduleFn("landregistry", "approve_land"), [String(landId)])
}

export function buildFinalizeLandPayload(landId: number) {
  // finalize_land(dlr: &signer, land_id: u64)
  return buildEntryFunctionPayload(moduleFn("landregistry", "finalize_land"), [String(landId)])
}

export function buildTransferLandPayload(landId: number, newOwnerAddress: string) {
  // transfer_land(owner: &signer, land_id: u64, new_owner: address)
  return buildEntryFunctionPayload(moduleFn("landregistry", "transfer_land"), [String(landId), newOwnerAddress])
}

export function buildAssignRolePayload(officialAddr: string, roleId: number) {
  // assign_role(admin: &signer, official_addr: address, role_id: u8)
  return buildEntryFunctionPayload(moduleFn("landregistry", "assign_role"), [officialAddr, String(roleId)])
}

// INSURANCE transactions
export function buildCreatePolicyPayload(landId: number, insuredAddress: string, sumInsured: number, premium: number) {
  // create_policy(insurer: &signer, land_id: u64, insured: address, sum_insured: u64, premium: u64)
  return buildEntryFunctionPayload(
    moduleFn("insurance", "create_policy"),
    [String(landId), insuredAddress, String(sumInsured), String(premium)]
  )
}

export function buildSubmitClaimPayload(policyId: number, reason: string, evidenceCid: string) {
  // submit_claim(claimant: &signer, policy_id: u64, reason: String, evidence_cid: String)
  return buildEntryFunctionPayload(
    moduleFn("insurance", "submit_claim"),
    [String(policyId), reason, evidenceCid]
  )
}

export function buildVerifyClaimPayload(claimId: number, approve: boolean, notes: string) {
  // verify_claim(verifier: &signer, claim_id: u64, approve: bool, notes: String)
  return buildEntryFunctionPayload(
    moduleFn("insurance", "verify_claim"),
    [String(claimId), approve, notes]
  )
}

export function buildPayoutClaimPayload(claimId: number) {
  // payout_claim(insurer: &signer, claim_id: u64)
  return buildEntryFunctionPayload(moduleFn("insurance", "payout_claim"), [String(claimId)])
}

// Convenience: submit via signer
export async function signAndSend(payload: any, signer: SignerFunc) {
  if (!signer) throw new Error("No signer provided")
  return signer(payload)
}

export default {}
