import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    crossFi: {
      url: process.env.CROSSFI_RPC_URL,
      accounts: [process.env.PRIVATE_KEY as string],
      gasPrice: 1410038500000000000, // Adjust based on network requirements
    },
  },
};

export default config;
