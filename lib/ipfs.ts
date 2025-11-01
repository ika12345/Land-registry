// IPFS helpers using NFT.Storage
import { NFTStorage } from "nft.storage"

const token = process.env.NEXT_PUBLIC_NFT_STORAGE_KEY || ""
const IPFS_GATEWAY = "https://ipfs.io/ipfs/"

// Initialize NFT.Storage client
const storage = token ? new NFTStorage({ token }) : null

export async function uploadJsonToIpfs(json: Record<string, any>): Promise<string> {
  if (!storage) {
    // fallback mock CID
    const mock = `QmMock${Math.random().toString(36).slice(2, 9)}`
    console.warn("NFT.Storage key not configured, returning mock CID:", mock)
    return mock
  }

  try {
    const blob = new Blob([JSON.stringify(json)], { type: "application/json" })
    const cid = await storage.storeBlob(blob)
    console.log("✅ Uploaded to IPFS:", cid)
    return cid
  } catch (err) {
    console.error("IPFS upload error:", err)
    throw err
  }
}

export async function uploadFile(file: File): Promise<string> {
  if (!storage) {
    // fallback mock CID
    const mock = `QmMock${Math.random().toString(36).slice(2, 9)}`
    console.warn("NFT.Storage key not configured, returning mock CID:", mock)
    return mock
  }

  try {
    const cid = await storage.storeBlob(file)
    console.log("✅ Uploaded file to IPFS:", cid)
    return cid
  } catch (err) {
    console.error("IPFS upload error:", err)
    throw err
  }
}

export function makeIpfsUrl(cid: string): string {
  return `${IPFS_GATEWAY}${cid}`
}

export default {}
