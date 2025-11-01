module registry_addr::landregistry {
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use aptos_framework::table::{Self, Table};
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::account;
    use aptos_framework::timestamp;

    // --- Roles ---
    const ROLE_PATWARI: u8 = 1;
    const ROLE_TEHSILDAR: u8 = 2;
    const ROLE_DLR: u8 = 3;

    // --- Land Status ---
    const STATUS_PROVISIONAL: u8 = 1;
    const STATUS_APPROVED: u8 = 2;
    const STATUS_FINALIZED: u8 = 3;
    const STATUS_DISPUTED: u8 = 99;

    // --- Error Codes ---
    const E_NOT_ADMIN: u64 = 1;
    const E_NOT_PATWARI: u64 = 2;
    const E_NOT_TEHSILDAR: u64 = 3;
    const E_NOT_DLR: u64 = 4;
    const E_LAND_NOT_FOUND: u64 = 5;
    const E_INVALID_STATUS: u64 = 6;
    const E_ROLE_ALREADY_EXISTS: u64 = 7;
    const E_NOT_INITIALIZED: u64 = 8;
    const E_NO_ROLE: u64 = 9;
    const E_NOT_OWNER: u64 = 10;

    // --- Structs ---
    struct LandParcel has store, drop, key, copy {
        land_id: u64,
        owner_wallet: address,
        coordinates_cid: String, // IPFS hash for GeoJSON
        document_cid: String,    // IPFS hash for PDF/Docs
        area_sq_meters: u64,
        status: u8,
        last_verified_by: address, 
        last_updated_timestamp: u64,
    }

    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    struct RegistryAdmin has key {
        roles: Table<address, u8>,
        land_records: Table<u64, LandParcel>,
        land_id_counter: u64,
        audit_log: event::EventHandle<AuditAction>,
    }

    #[event]
    struct AuditAction has drop, store {
        land_id: u64,
        actor: address,
        action: String,
        timestamp: u64,
    }

    // --- Module Initializer ---
    public entry fun initialize_registry(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        let deployer_addr = @registry_addr;
        assert!(admin_addr == deployer_addr, E_NOT_ADMIN);

        move_to(admin, RegistryAdmin {
            roles: table::new(),
            land_records: table::new(),
            land_id_counter: 0,
            audit_log: account::new_event_handle<AuditAction>(admin),
        });

        let registry = borrow_global_mut<RegistryAdmin>(admin_addr);
        table::add(&mut registry.roles, admin_addr, ROLE_DLR);
    }

    // --- Role Management ---
    public entry fun assign_role(admin: &signer, official_addr: address, role_id: u8)
    acquires RegistryAdmin {
        let admin_addr = signer::address_of(admin);
        assert_has_role(admin_addr, ROLE_DLR);
        
        let registry = borrow_global_mut<RegistryAdmin>(@registry_addr);
        
        if (table::contains(&registry.roles, official_addr)) {
            let existing_role = table::borrow_mut(&mut registry.roles, official_addr);
            *existing_role = role_id;
        } else {
            table::add(&mut registry.roles, official_addr, role_id);
        }
    }

    // --- Core Land Functions ---

    public entry fun register_land(
        patwari: &signer, 
        owner_wallet: address, 
        coordinates_cid: String, 
        document_cid: String, 
        area: u64
    ) acquires RegistryAdmin {
        let patwari_addr = signer::address_of(patwari);
        assert_has_role(patwari_addr, ROLE_PATWARI);
        
        let registry = borrow_global_mut<RegistryAdmin>(@registry_addr);
        registry.land_id_counter = registry.land_id_counter + 1;
        let new_id = registry.land_id_counter;
        let timestamp = timestamp::now_seconds();

        let new_parcel = LandParcel {
            land_id: new_id,
            owner_wallet: owner_wallet,
            coordinates_cid: coordinates_cid,
            document_cid: document_cid,
            area_sq_meters: area,
            status: STATUS_PROVISIONAL,
            last_verified_by: patwari_addr,
            last_updated_timestamp: timestamp,
        };
        
        table::add(&mut registry.land_records, new_id, new_parcel);
        emit_audit_log(registry, new_id, patwari_addr, string::utf8(b"REGISTER_PROVISIONAL"), timestamp);
    }

    public entry fun approve_land(tehsildar: &signer, land_id: u64)
    acquires RegistryAdmin {
        let tehsildar_addr = signer::address_of(tehsildar);
        assert_has_role(tehsildar_addr, ROLE_TEHSILDAR);

        let registry = borrow_global_mut<RegistryAdmin>(@registry_addr);
        assert!(table::contains(&registry.land_records, land_id), E_LAND_NOT_FOUND);

        let parcel = table::borrow_mut(&mut registry.land_records, land_id);
        assert!(parcel.status == STATUS_PROVISIONAL, E_INVALID_STATUS);
        
        let timestamp = timestamp::now_seconds();
        parcel.status = STATUS_APPROVED;
        parcel.last_verified_by = tehsildar_addr;
        parcel.last_updated_timestamp = timestamp;

        emit_audit_log(registry, land_id, tehsildar_addr, string::utf8(b"APPROVE"), timestamp);
    }

    public entry fun finalize_land(dlr: &signer, land_id: u64)
    acquires RegistryAdmin {
        let dlr_addr = signer::address_of(dlr);
        assert_has_role(dlr_addr, ROLE_DLR);

        let registry = borrow_global_mut<RegistryAdmin>(@registry_addr);
        assert!(table::contains(&registry.land_records, land_id), E_LAND_NOT_FOUND);

        let parcel = table::borrow_mut(&mut registry.land_records, land_id);
        assert!(parcel.status == STATUS_APPROVED, E_INVALID_STATUS);
        
        let timestamp = timestamp::now_seconds();
        parcel.status = STATUS_FINALIZED;
        parcel.last_verified_by = dlr_addr;
        parcel.last_updated_timestamp = timestamp;

        emit_audit_log(registry, land_id, dlr_addr, string::utf8(b"FINALIZE"), timestamp);
    }

    // ✅ --- New Function: Transfer Land ---
    public entry fun transfer_land(
        owner: &signer,
        land_id: u64,
        new_owner: address
    ) acquires RegistryAdmin {
        let owner_addr = signer::address_of(owner);
        let registry = borrow_global_mut<RegistryAdmin>(@registry_addr);
        assert!(table::contains(&registry.land_records, land_id), E_LAND_NOT_FOUND);

        let parcel = table::borrow_mut(&mut registry.land_records, land_id);
        assert!(parcel.owner_wallet == owner_addr, E_NOT_OWNER);
        assert!(parcel.status == STATUS_FINALIZED, E_INVALID_STATUS);

        let timestamp = timestamp::now_seconds();
        parcel.owner_wallet = new_owner;
        parcel.last_updated_timestamp = timestamp;
        parcel.last_verified_by = owner_addr; // record who initiated

        emit_audit_log(registry, land_id, owner_addr, string::utf8(b"TRANSFER_OWNERSHIP"), timestamp);
    }

    // --- Helper Functions ---
    friend registry_addr::insurance;

    public(friend) fun assert_has_role(actor_addr: address, role_id: u8)
    acquires RegistryAdmin {
        assert!(exists<RegistryAdmin>(@registry_addr), E_NOT_INITIALIZED);
        let registry = borrow_global<RegistryAdmin>(@registry_addr);
        assert!(table::contains(&registry.roles, actor_addr), E_NO_ROLE);
        let role = table::borrow(&registry.roles, actor_addr);
        assert!(*role >= role_id, E_NO_ROLE);
    }

    fun emit_audit_log(
        registry: &mut RegistryAdmin, 
        land_id: u64, 
        actor: address, 
        action: String, 
        timestamp: u64
    ) {
        event::emit_event(&mut registry.audit_log, AuditAction {
            land_id,
            actor,
            action,
            timestamp,
        });
    }

    // --- View Functions ---
    #[view]
    public fun get_land_details(land_id: u64): LandParcel
    acquires RegistryAdmin {
        assert!(exists<RegistryAdmin>(@registry_addr), E_NOT_INITIALIZED);
        let registry = borrow_global<RegistryAdmin>(@registry_addr);
        assert!(table::contains(&registry.land_records, land_id), E_LAND_NOT_FOUND);
        *table::borrow(&registry.land_records, land_id)
    }

    #[view]
    public fun get_user_role(user_addr: address): u8
    acquires RegistryAdmin {
        if (!exists<RegistryAdmin>(@registry_addr)) {
            return 0
        };
        let registry = borrow_global<RegistryAdmin>(@registry_addr);
        if (table::contains(&registry.roles, user_addr)) {
            *table::borrow(&registry.roles, user_addr)
        } else {
            0
        }
    }
}
