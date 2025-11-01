# Aptos Land Registry & Insurance dApp

A complete blockchain-based land registry and insurance management system built on the Aptos blockchain using Next.js.

## Features

### Land Management
- **Register Land** (Patwari only) - Upload geolocation and document files to IPFS
- **Approve Land** (Tehsildar) - Review and approve provisional land parcels
- **Finalize Land** (DLR) - Complete the verification process
- **Transfer Ownership** - Transfer finalized land to new owners
- **View Details** - Complete land information with document access

### Insurance System
- **Create Policies** (Insurers) - Create insurance policies for finalized lands
- **Submit Claims** - File claims for land damage or issues
- **Review Claims** (Tehsildar/DLR) - Approve or reject submitted claims
- **Track Status** - Monitor all claims and policies in real-time

## Project Structure

\`\`\`
├── app/
│   ├── page.tsx                 # Dashboard
│   ├── land/
│   │   ├── page.tsx            # Land management list
│   │   ├── register/           # Register new land
│   │   └── [id]/               # Land detail page
│   └── insurance/
│       ├── page.tsx            # Insurance management
│       ├── policy/
│       │   ├── create/         # Create policy
│       │   └── [id]/           # Policy detail
│       └── claim/
│           ├── submit/         # Submit claim
│           └── [id]/           # Claim detail
├── components/
│   ├── ui/                     # shadcn UI components
│   ├── status-badge.tsx        # Status badge
│   ├── role-badge.tsx          # Role badge
│   ├── transaction-button.tsx  # Transaction button
│   ├── ipfs-uploader.tsx       # IPFS file upload
│   ├── land-card.tsx           # Land card component
│   ├── policy-card.tsx         # Policy card component
│   ├── claim-card.tsx          # Claim card component
│   └── metadata-viewer.tsx     # IPFS metadata viewer
├── hooks/
│   ├── use-aptos-account.ts    # Wallet connection
│   ├── use-land-details.ts     # Fetch land info
│   ├── use-user-role.ts        # Fetch user role
│   ├── use-all-lands.ts        # Fetch all lands
│   ├── use-policies.ts         # Fetch policies
│   ├── use-claims.ts           # Fetch claims
│   └── use-account-stats.ts    # Fetch user stats
├── lib/
│   ├── aptos-config.ts         # Constants and config
│   ├── transaction-utils.ts    # Transaction helpers
│   └── error-handler.ts        # Error handling
└── types/
    └── aptos.ts                # TypeScript types
\`\`\`

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file with:

\`\`\`
NEXT_PUBLIC_APTOS_MODULE_ADDRESS=your_module_address
NEXT_PUBLIC_APTOS_NETWORK=devnet
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
NFT_STORAGE_KEY=your_nft_storage_key
\`\`\`

### 2. Install Dependencies

Install dependencies and (optionally) test/dev tools:

```bash
# from project root
npm install
# optional - to run unit tests locally
npm install -D jest ts-jest @types/jest @types/node
```

### 3. Wallet Integration

Replace the wallet connection placeholder in `hooks/use-aptos-account.ts` with actual wallet adapter:

\`\`\`typescript
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export function useAptosAccount() {
  const { account, connected } = useWallet();
  // ... rest of implementation
}
\`\`\`

### 4. Smart Contract Integration

Update the following hooks with actual Aptos view function calls:
- `hooks/use-land-details.ts` - Call `get_land_details`
- `hooks/use-all-lands.ts` - Call view function for all lands
- `hooks/use-user-role.ts` - Call `get_user_role`
- `hooks/use-policies.ts` - Call view function for policies
- `hooks/use-claims.ts` - Call view function for claims

Replace transaction payloads in pages with actual function calls:
- Land registration in `app/land/register/page.tsx`
- Policy creation in `app/insurance/policy/create/page.tsx`
- Claim submission in `app/insurance/claim/submit/page.tsx`

### 5. IPFS Integration

Update `components/ipfs-uploader.tsx` with nft.storage upload:

\`\`\`typescript
import { NFTStorage } from "nft.storage";

const client = new NFTStorage({ token: process.env.NFT_STORAGE_KEY });
const cid = await client.store(file);
\`\`\`

## Role-Based Access Control

- **Patwari**: Register land parcels
- **Tehsildar**: Approve provisional lands, review claims
- **DLR**: Finalize approved lands, review claims
- **Owner**: Transfer finalized land, view owned parcels
- **Insurer**: Create insurance policies, cancel policies
- **Anyone**: View public land and insurance information

## API Endpoints (to be implemented)

\`\`\`
GET  /api/lands              # Get all lands
GET  /api/lands/:id          # Get land details
POST /api/lands              # Register new land
PUT  /api/lands/:id          # Update land (approve/finalize)

GET  /api/policies           # Get all policies
GET  /api/policies/:id       # Get policy details
POST /api/policies           # Create policy

GET  /api/claims             # Get all claims
GET  /api/claims/:id         # Get claim details
POST /api/claims             # Submit claim
PUT  /api/claims/:id         # Review claim
\`\`\`

## Deployment

Deploy to Vercel:

\`\`\`bash
npm run build
vercel deploy
\`\`\`

Set environment variables in Vercel dashboard under Settings > Environment Variables.


1. **User connects wallet** via wallet adapter
2. **User role is fetched** from smart contract
3. **User can perform role-specific actions**:
   - Patwari: Register lands
   - Tehsildar: Approve lands, review claims
   - DLR: Finalize lands, review claims
4. **IPFS files** are uploaded for land documents
5. **Transactions are signed** by user wallet
6. **Data is fetched** from smart contract after transaction

## Error Handling

All errors are caught and displayed to users with helpful messages:
- Insufficient funds
- Unauthorized access
- Network errors
- Validation errors
- Transaction failures

See `lib/error-handler.ts` for error parsing logic.

## Future Enhancements

- Real-time event subscriptions
- Advanced search and filtering
- Pagination for large datasets
- Claim history and timeline
- Land value estimation
- Multi-chain support
- Mobile app integration
