// Read-only view helpers to fetch lands, policies, claims from chain
import { APTOS_CONFIG } from "./aptos-config"

export interface AptosClientLike {
  view: (payload: { function: string; type_arguments: any[]; arguments: any[] }) => Promise<any>
}

function moduleFn(moduleName: string, fnName: string) {
  return `${APTOS_CONFIG.MODULE_ADDRESS}::${moduleName}::${fnName}`
}

// Note: The Move contracts don't have a "get all" function, only get-by-id
// In production, you'd need to track IDs separately or add such functions
export async function fetchLandById(client: AptosClientLike | undefined, landId: string): Promise<any> {
  if (!client) return null
  const payload = { 
    function: moduleFn("landregistry", "get_land_details"), 
    type_arguments: [], 
    arguments: [landId] 
  }
  try {
    return await client.view(payload)
  } catch (error) {
    console.error("Error fetching land:", error)
    return null
  }
}

export async function fetchUserRole(client: AptosClientLike | undefined, userAddr: string): Promise<number> {
  if (!client) return 0
  const payload = { 
    function: moduleFn("landregistry", "get_user_role"), 
    type_arguments: [], 
    arguments: [userAddr] 
  }
  try {
    const result = await client.view(payload)
    return Array.isArray(result) ? result[0] : result
  } catch (error) {
    console.error("Error fetching user role:", error)
    return 0
  }
}

export async function fetchPolicy(client: AptosClientLike | undefined, policyId: string): Promise<any> {
  if (!client) return null
  const payload = { 
    function: moduleFn("insurance", "get_policy"), 
    type_arguments: [], 
    arguments: [policyId] 
  }
  try {
    return await client.view(payload)
  } catch (error) {
    console.error("Error fetching policy:", error)
    return null
  }
}

export async function fetchClaim(client: AptosClientLike | undefined, claimId: string): Promise<any> {
  if (!client) return null
  const payload = { 
    function: moduleFn("insurance", "get_claim"), 
    type_arguments: [], 
    arguments: [claimId] 
  }
  try {
    return await client.view(payload)
  } catch (error) {
    console.error("Error fetching claim:", error)
    return null
  }
}

export default {}
