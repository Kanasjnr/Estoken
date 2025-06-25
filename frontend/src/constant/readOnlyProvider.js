import { JsonRpcProvider } from "ethers";

export const readOnlyProvider = new JsonRpcProvider(
  import.meta.env.VITE_APP_BASE_RPC_URL || "https://sepolia.base.org"
);