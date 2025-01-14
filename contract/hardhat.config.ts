import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { vars } from "hardhat/config";

const ALCHEMY_API_KEY = vars.get("ALCHEMY_API_KEY");
const BASESCAN_API_KEY = vars.get("BASESCAN_API_KEY");

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    base_sepolia: {
      url: `https://base-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [vars.get("MY_KEY")],
    },
  },
  etherscan: {
    apiKey: BASESCAN_API_KEY,

    customChains: [
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org",
        },
      },
    ],
  },
};

export default config;