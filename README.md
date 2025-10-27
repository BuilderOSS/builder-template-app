# Nouns Builder Template Site

> ⚠️ **Note**: This template is in active development. Full theming functionality is not yet available or fully tested. Expect breaking changes and missing features.

This is a template site for Nouns Builder DAOs, built with [Next.js](https://nextjs.org) and integrated with the Nouns Builder ecosystem.

Built using packages from the [Nouns Builder](https://github.com/BuilderOSS/nouns-builder) monorepo, which provides the UI components, React hooks, utilities, SDK, and core functionality for interacting with Nouns Builder DAOs.

## Quick Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Configuration

Create your environment file from the sample:

```bash
cp sample.env .env.local
```

Edit `.env.local` with your DAO configuration:

```bash
# Required: Network configuration
NEXT_PUBLIC_NETWORK_TYPE="mainnet"  # or "testnet"
NEXT_PUBLIC_CHAIN_ID="8453"         # Chain ID (1=Ethereum, 8453=Base, 10=Optimism, 7777777=Zora)
NEXT_PUBLIC_DAO_TOKEN_ADDRESS="0xe8af882f2f5c79580230710ac0e2344070099432"

# Required: Core functionality
PINATA_API_KEY=                     # Required for IPFS file uploads
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=  # Required for wallet connections

# Optional: RPC providers for robust connectivity
NEXT_PUBLIC_ALCHEMY_API_KEY=        # Optional RPC provider
NEXT_PUBLIC_TENDERLY_RPC_KEY=       # Optional RPC provider (see Tenderly section below)

# Optional: Tenderly integration (for transaction simulation)
NEXT_PUBLIC_DISABLE_TENDERLY_SIMULATION="true"  # Set to "false" to enable
TENDERLY_ACCESS_KEY=
TENDERLY_PROJECT=
TENDERLY_USER=
NEXT_PUBLIC_TENDERLY_RPC_KEY=

# Optional: AI transaction summaries, uses vercel's AI Gateway
NEXT_PUBLIC_DISABLE_AI_SUMMARY="true"  # Set to "false" to enable
AI_MODEL=
AI_GATEWAY_API_KEY=

# Optional: Redis for caching
REDIS_URL=
```

### 3. Fetch DAO Configuration

Before running the development server, fetch your DAO's contract addresses and metadata:

```bash
pnpm fetch-dao
```

This script will:

- Validate your environment variables
- Fetch DAO contract addresses from the blockchain
- Generate a favicon from your DAO's image
- Create configuration files in `src/config/`

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see your DAO site.

## Environment Variables

### Required Variables

| Variable                                | Description                       | Example                                        |
| --------------------------------------- | --------------------------------- | ---------------------------------------------- |
| `NEXT_PUBLIC_NETWORK_TYPE`              | Network environment               | `"mainnet"` or `"testnet"`                     |
| `NEXT_PUBLIC_CHAIN_ID`                  | Blockchain network ID             | `"8453"` (Base), `"1"` (Ethereum)              |
| `NEXT_PUBLIC_DAO_TOKEN_ADDRESS`         | Your DAO's token contract address | `"0xe8af882f2f5c79580230710ac0e2344070099432"` |
| `PINATA_API_KEY`                        | Pinata API key                    | **Required** for IPFS file uploads             |
| `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` | WalletConnect project ID          | **Required** for wallet connections            |

### Network Configuration

The `NEXT_PUBLIC_NETWORK_TYPE` should match your chain:

- **Mainnet chains**: Ethereum (1), Base (8453), Optimism (10), Zora (7777777)
- **Testnet chains**: Set `NEXT_PUBLIC_NETWORK_TYPE="testnet"` for test networks

### Optional RPC Providers

| Variable                       | Description      | Purpose                                       |
| ------------------------------ | ---------------- | --------------------------------------------- |
| `NEXT_PUBLIC_ALCHEMY_API_KEY`  | Alchemy API key  | Optional RPC provider for robust connectivity |
| `NEXT_PUBLIC_TENDERLY_RPC_KEY` | Tenderly RPC key | Optional RPC provider for robust connectivity |

### Optional Tenderly Simulation

| Variable                                  | Description                    | Required When                         |
| ----------------------------------------- | ------------------------------ | ------------------------------------- |
| `NEXT_PUBLIC_DISABLE_TENDERLY_SIMULATION` | Disable transaction simulation | Set to `"false"` to enable simulation |
| `TENDERLY_ACCESS_KEY`                     | Tenderly access key            | **Required** if simulation enabled    |
| `TENDERLY_PROJECT`                        | Tenderly project name          | **Required** if simulation enabled    |
| `TENDERLY_USER`                           | Tenderly username              | **Required** if simulation enabled    |

> **Note**: When `NEXT_PUBLIC_SKIP_TENDERLY_SIMULATION="false"`, all Tenderly variables become required for proposal creation. The app simulates proposal transactions using Tenderly to ensure they can be executed before posting on-chain.

### Optional AI Transaction Summaries

| Variable                         | Description                    | Required When                        |
| -------------------------------- | ------------------------------ | ------------------------------------ |
| `NEXT_PUBLIC_DISABLE_AI_SUMMARY` | Disable AI transaction summary | Set to `"false"` to enable summaries |
| `AI_MODEL`                       | AI model                       | **Required** if summaries enabled    |
| `AI_GATEWAY_API_KEY`             | AI Gateway API key             | **Required** if summaries enabled    |

### Optional Redis Caching

| Variable    | Description | Purpose                            |
| ----------- | ----------- | ---------------------------------- |
| `REDIS_URL` | Redis URL   | Cache rate limits and ai summaries |

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production (automatically runs `fetch-dao`)
- `pnpm start` - Start production server
- `pnpm fetch-dao` - Fetch DAO addresses and generate config
- `pnpm lint` - Run linting and type checking
- `pnpm type-check` - Run TypeScript type checking

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.
