import { JsonRpcProvider } from "ethers";

export const readOnlyProvider = new JsonRpcProvider(
  import.meta.env.VITE_APP_CROSSFI_RPC_URL
);