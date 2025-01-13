import { JsonRpcProvider } from "ethers";

export const readOnlyProvider = new JsonRpcProvider(
  import.meta.env.VITE_RPC_URL
);