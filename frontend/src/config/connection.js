import { createAppKit } from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { defineChain } from "@reown/appkit/networks";

const celoAlfajores = defineChain({
  id: 44787,
  caipNetworkId: "eip155:44787",
  chainNamespace: "eip155",
  name: "Celo Alfajores Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "CELO",
    symbol: "CELO",
  },
  rpcUrls: {
    default: {
      http: ["https://alfajores-forno.celo-mainnet.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "Celo Explorer",
      url: "https://explorer.celo.org/alfajores",
    },
  },
  contracts: {
    // Add the contracts here
  },
});

// 1. Get projectId
const projectId = import.meta.env.VITE_APP_APPKIT_PROJECT_ID;

// 2. Set the networks
// const networks = [crossFiTestnet, sepolia];

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
  networks: [celoAlfajores],
  chainImages: {
    [celoAlfajores.id]:
      "https://s2.coinmarketcap.com/static/img/coins/64x64/5567.png",
  },
  metadata,
  projectId,
  allowUnsupportedChain: false,
  allWallets: "SHOW",
  defaultNetwork: celoAlfajores,
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