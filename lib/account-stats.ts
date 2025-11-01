import { fetchAllLands, fetchPoliciesByOwner, fetchClaimsByPolicy } from "./views"

export async function getAccountStats(client: any, address: string) {
  if (!client) return { ownedLands: 0, activePolicies: 0, openClaims: 0 }

  try {
    const lands = await fetchAllLands(client)
    const owned = Array.isArray(lands) ? lands.filter((l: any) => l.owner === address).length : 0

    const policies = await fetchPoliciesByOwner(client, address)
    const activePolicies = Array.isArray(policies) ? policies.filter((p: any) => p.status === 1).length : 0

    // aggregate claims for all policies
    let openClaims = 0
    if (Array.isArray(policies)) {
      for (const p of policies) {
        const claims = await fetchClaimsByPolicy(client, p.id)
        if (Array.isArray(claims)) openClaims += claims.filter((c: any) => c.status === 1).length
      }
    }

    return { ownedLands: owned, activePolicies, openClaims }
  } catch (err) {
    console.error("getAccountStats error:", err)
    return { ownedLands: 0, activePolicies: 0, openClaims: 0 }
  }
}

export default {}
