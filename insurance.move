module registry_addr::insurance {
    use std::signer;
    use std::string::{Self, String};
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::timestamp;
    use aptos_framework::table::{Self, Table};
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;

    use registry_addr::landregistry; // friend access for role checks

    // Reuse role ids from landregistry (values must match)
    const ROLE_PATWARI: u8 = 1;
    const ROLE_TEHSILDAR: u8 = 2;
    const ROLE_DLR: u8 = 3;

    // Claim status
    const CLAIM_PENDING: u8 = 1;
    const CLAIM_APPROVED: u8 = 2;
    const CLAIM_REJECTED: u8 = 3;
    const CLAIM_PAID: u8 = 4;

    // Policy status
    const POLICY_ACTIVE: u8 = 1;
    const POLICY_CANCELLED: u8 = 9;

    // Errors
    const E_NOT_ADMIN: u64 = 1;
    const E_NOT_INSURER: u64 = 2;
    const E_POLICY_NOT_FOUND: u64 = 3;
    const E_CLAIM_NOT_FOUND: u64 = 4;
    const E_INVALID_STATUS: u64 = 5;
    const E_UNAUTHORIZED: u64 = 6;

    struct Policy has store, drop, copy {
        policy_id: u64,
        land_id: u64,
        insurer: address,
        insured: address,
        sum_insured: u64,
        premium: u64,
        status: u8,
        created_ts: u64,
    }

    struct Claim has store, drop, copy {
        claim_id: u64,
        policy_id: u64,
        claimant: address,
        reason: String,
        evidence_cid: String,
        status: u8,
        decided_by: address,
        decided_ts: u64,
    }

    struct InsuranceAdmin has key {
        policies: Table<u64, Policy>,
        claims: Table<u64, Claim>,
        policy_counter: u64,
        claim_counter: u64,
        policy_events: EventHandle<PolicyCreated>,
        claim_events: EventHandle<ClaimSubmitted>,
        verify_events: EventHandle<ClaimVerified>,
        payout_events: EventHandle<ClaimPaid>,
    }

    #[event]
    struct PolicyCreated has drop, store {
        policy_id: u64,
        land_id: u64,
        insurer: address,
        insured: address,
        sum_insured: u64,
        premium: u64,
        created_ts: u64,
    }

    #[event]
    struct ClaimSubmitted has drop, store {
        claim_id: u64,
        policy_id: u64,
        claimant: address,
        timestamp: u64,
    }

    #[event]
    struct ClaimVerified has drop, store {
        claim_id: u64,
        policy_id: u64,
        approved: bool,
        verifier: address,
        timestamp: u64,
        notes: String,
    }

    #[event]
    struct ClaimPaid has drop, store {
        claim_id: u64,
        policy_id: u64,
        insurer: address,
        insured: address,
        amount: u64,
        timestamp: u64,
    }

    // Initialize admin resource under module address
    public entry fun initialize_insurance(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        let deployer_addr = @registry_addr;
        assert!(admin_addr == deployer_addr, E_NOT_ADMIN);

        move_to(admin, InsuranceAdmin {
            policies: table::new(),
            claims: table::new(),
            policy_counter: 0,
            claim_counter: 0,
            policy_events: aptos_framework::account::new_event_handle<PolicyCreated>(admin),
            claim_events: aptos_framework::account::new_event_handle<ClaimSubmitted>(admin),
            verify_events: aptos_framework::account::new_event_handle<ClaimVerified>(admin),
            payout_events: aptos_framework::account::new_event_handle<ClaimPaid>(admin),
        });
    }

    // Create a policy by the insurer
    public entry fun create_policy(
        insurer: &signer,
        land_id: u64,
        insured: address,
        sum_insured: u64,
        premium: u64,
    ) acquires InsuranceAdmin {
        let insurer_addr = signer::address_of(insurer);
        ensure_initialized();

        let admin = borrow_global_mut<InsuranceAdmin>(@registry_addr);
        admin.policy_counter = admin.policy_counter + 1;
        let pid = admin.policy_counter;
        let ts = timestamp::now_seconds();

        let policy = Policy { policy_id: pid, land_id, insurer: insurer_addr, insured, sum_insured, premium, status: POLICY_ACTIVE, created_ts: ts };
        table::add(&mut admin.policies, pid, policy);
        event::emit_event(&mut admin.policy_events, PolicyCreated { policy_id: pid, land_id, insurer: insurer_addr, insured, sum_insured, premium, created_ts: ts });
    }

    // Submit a claim by the insured (or any claimant address)
    public entry fun submit_claim(
        claimant: &signer,
        policy_id: u64,
        reason: String,
        evidence_cid: String,
    ) acquires InsuranceAdmin {
        let claimant_addr = signer::address_of(claimant);
        ensure_initialized();

        let admin = borrow_global_mut<InsuranceAdmin>(@registry_addr);
        assert!(table::contains(&admin.policies, policy_id), E_POLICY_NOT_FOUND);
        let policy = table::borrow(&admin.policies, policy_id);
        assert!(policy.status == POLICY_ACTIVE, E_INVALID_STATUS);

        admin.claim_counter = admin.claim_counter + 1;
        let cid = admin.claim_counter;
        let claim = Claim { claim_id: cid, policy_id, claimant: claimant_addr, reason, evidence_cid, status: CLAIM_PENDING, decided_by: @0x0, decided_ts: 0 };
        table::add(&mut admin.claims, cid, claim);
        event::emit_event(&mut admin.claim_events, ClaimSubmitted { claim_id: cid, policy_id, claimant: claimant_addr, timestamp: timestamp::now_seconds() });
    }

    // Verify a claim by Tehsildar or DLR
    public entry fun verify_claim(
        verifier: &signer,
        claim_id: u64,
        approve: bool,
        notes: String,
    ) acquires InsuranceAdmin {
        let vaddr = signer::address_of(verifier);
        // Require role >= TEHSILDAR
        landregistry::assert_has_role(vaddr, ROLE_TEHSILDAR);

        let admin = borrow_global_mut<InsuranceAdmin>(@registry_addr);
        assert!(table::contains(&admin.claims, claim_id), E_CLAIM_NOT_FOUND);
        let claim = table::borrow_mut(&mut admin.claims, claim_id);
        assert!(claim.status == CLAIM_PENDING, E_INVALID_STATUS);

        claim.status = if (approve) { CLAIM_APPROVED } else { CLAIM_REJECTED };
        claim.decided_by = vaddr;
        claim.decided_ts = timestamp::now_seconds();

        event::emit_event(&mut admin.verify_events, ClaimVerified {
            claim_id,
            policy_id: claim.policy_id,
            approved: approve,
            verifier: vaddr,
            timestamp: claim.decided_ts,
            notes,
        });
    }

    // Payout by insurer: transfers AptosCoin from insurer to insured if approved
    public entry fun payout_claim(
        insurer: &signer,
        claim_id: u64,
    ) acquires InsuranceAdmin {
        let insurer_addr = signer::address_of(insurer);
        let admin = borrow_global_mut<InsuranceAdmin>(@registry_addr);
        assert!(table::contains(&admin.claims, claim_id), E_CLAIM_NOT_FOUND);
        let claim = table::borrow_mut(&mut admin.claims, claim_id);
        assert!(claim.status == CLAIM_APPROVED, E_INVALID_STATUS);

        let policy = table::borrow(&admin.policies, claim.policy_id);
        assert!(policy.insurer == insurer_addr, E_UNAUTHORIZED);

        // Transfer payout
        coin::transfer<AptosCoin>(insurer, policy.insured, policy.sum_insured);
        claim.status = CLAIM_PAID;

        event::emit_event(&mut admin.payout_events, ClaimPaid {
            claim_id,
            policy_id: policy.policy_id,
            insurer: insurer_addr,
            insured: policy.insured,
            amount: policy.sum_insured,
            timestamp: timestamp::now_seconds(),
        });
    }

    // Views
    #[view]
    public fun get_policy(policy_id: u64): Policy acquires InsuranceAdmin {
        ensure_initialized();
        let admin = borrow_global<InsuranceAdmin>(@registry_addr);
        assert!(table::contains(&admin.policies, policy_id), E_POLICY_NOT_FOUND);
        *table::borrow(&admin.policies, policy_id)
    }

    #[view]
    public fun get_claim(claim_id: u64): Claim acquires InsuranceAdmin {
        ensure_initialized();
        let admin = borrow_global<InsuranceAdmin>(@registry_addr);
        assert!(table::contains(&admin.claims, claim_id), E_CLAIM_NOT_FOUND);
        *table::borrow(&admin.claims, claim_id)
    }

    fun ensure_initialized() {
        assert!(exists<InsuranceAdmin>(@registry_addr), E_NOT_ADMIN);
    }
}


