// Basic unit tests for transaction builders (requires jest/ts-jest to run)
import {
  buildRegisterLandPayload,
  buildTransferLandPayload,
  buildCreatePolicyPayload,
  buildSubmitClaimPayload,
} from "@/lib/transactions"

describe("transactions payload builders", () => {
  it("buildRegisterLandPayload produces entry payload", () => {
    const p = buildRegisterLandPayload("QmCid", "0xabc")
    expect(p).toHaveProperty("type", "entry_function_payload")
    expect(p.arguments).toEqual(["0xabc", "QmCid"])
  })

  it("buildTransferLandPayload has correct args", () => {
    const p = buildTransferLandPayload("land1", "0xdef")
    expect(p.arguments).toEqual(["land1", "0xdef"])
  })

  it("buildCreatePolicyPayload has premium and cid", () => {
    const p = buildCreatePolicyPayload("QmPolicy", "0xowner", "100000000")
    expect(p.arguments[0]).toBe("0xowner")
    expect(p.arguments[1]).toBe("QmPolicy")
  })
})
