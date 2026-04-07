# OnMint - Pokemon Card NFT Marketplace

OnMint is a decentralized application (dApp) for minting, collecting, and trading Pokemon cards as Non-Fungible Tokens (NFTs).

This project consists of:

- **Smart Contracts** built with [Foundry](https://getfoundry.sh/) and [Solidity](https://soliditylang.org/).
- **Frontend** built with [React](https://react.dev/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/), [Wagmi](https://wagmi.sh/), and [RainbowKit](https://www.rainbowkit.com/).

## Features

- **NFT Minting**: Mint unique Pokemon Cards with metadata containing name, rarity, series, and custom images (stored on IPFS via Pinata).
- **Marketplace**: List, buy, and sell Pokemon Cards securely using the smart contract marketplace.
- **Royalties**: ERC-2981 support for secondary sales royalties.
- **Wallet Connection**: Seamless web3 login experience via RainbowKit.

## Repository Structure

```
.
├── frontend/          # React + Vite frontend application
│   └── OnMint/
└── smart-contract/    # Foundry project containing Solidity contracts
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18+)
- [Foundry](https://getfoundry.sh/) (Forge, Cast, Anvil, Chisel)
- Web3 Wallet (e.g., MetaMask)

### 1. Smart Contracts Setup

Navigate to the `smart-contract` directory:

```bash
cd smart-contract
```

Install dependencies:

```bash
forge install
```

Compile the contracts:

```bash
forge build
```

Run tests:

```bash
forge test
```

Deploying to local Anvil node:

```bash
# Terminal 1: Start local node
anvil

# Terminal 2: Run deployment script
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast
```

### 2. Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend/OnMint
```

Install dependencies:

```bash
npm install
```

Configure your environment variables:
Create a `.env` file in the frontend root and add your required keys (e.g., WalletConnect Project ID, Pinata API keys).

Run the development server:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173`.

## Technologies Used

- **Smart Contracts**: Solidity ^0.8.28, OpenZeppelin Contracts, Foundry
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4
- **Web3**: Wagmi, Viem, RainbowKit
- **Storage**: Pinata (IPFS)

## License

This project is licensed under the MIT License.
