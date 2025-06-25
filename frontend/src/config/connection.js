import { createAppKit } from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { defineChain } from "@reown/appkit/networks";

const baseSepolia = defineChain({
  id: 84532,
  caipNetworkId: "eip155:84532",
  chainNamespace: "eip155",
  name: "Base Sepolia Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://sepolia.base.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "BaseScan",
      url: "https://sepolia.basescan.org",
    },
  },
  contracts: {
    // Add the contracts here
  },
});

// 1. Get projectId
const projectId = import.meta.env.VITE_APP_APPKIT_PROJECT_ID;

// 2. Set the networks
// Using Base Sepolia Testnet

// 3. Create a metadata object - optional
const metadata = {
  name: "My Website",
  description: "My Website description",
  url: "https://mywebsite.com", // origin must match your domain & subdomain
  icons: ["https://avatars.mywebsite.com/"],
};

// 4. Create a AppKit instance
export const appkit = createAppKit({
  adapters: [new EthersAdapter()],
  networks: [baseSepolia],
  chainImages: {
    [baseSepolia.id]:
      "https://s2.coinmarketcap.com/static/img/coins/64x64/7226.png",
  },
  metadata,
  projectId,
  allowUnsupportedChain: false,
  allWallets: "SHOW",
  defaultNetwork: baseSepolia,
  enableEIP6963: true,
  themeVariables: {
    '--w3m-color-mix': '#1c1917',
    '--w3m-color-mix-strength': 40,
    "--wcm-accent-color": "#4CAF50",  },
  themeMode: "dark",
  features: {
    analytics: true,
    allWallets: true,
    email: false,
    socials: [],
  },
});