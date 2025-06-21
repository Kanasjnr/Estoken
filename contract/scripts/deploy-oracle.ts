import { ethers } from "hardhat";

async function main() {
  console.log("Deploying RealEstateOracle contract...");

  // Chainlink Functions configuration for Sepolia testnet
  // You'll need to update these values for your specific network and subscription
  const ROUTER_ADDRESS = "0x53BA5D8E5aab0cf9589aCE139666Be2b9Fd268e2"; // Celo alfajores Functions Router
  const DON_ID = "0x66756e2d63656c6f2d616c66616a6f7265732d31000000000000000000000000"; //  DON ID
  const SUBSCRIPTION_ID = 124; // Replace with your actual subscription ID
  
  // First, get the deployed RealEstateToken contract address
  // You should replace this with your actual deployed contract address
  const REAL_ESTATE_TOKEN_ADDRESS = "0xb736fe83AB4a6dDEBa2630c0a766fA71bb5f3871"; // Replace with your RealEstateToken address

  // Deploy RealEstateOracle
  const RealEstateOracle = await ethers.getContractFactory("RealEstateOracle");
  const oracle = await RealEstateOracle.deploy(
    ROUTER_ADDRESS,
    DON_ID,
    SUBSCRIPTION_ID,
    REAL_ESTATE_TOKEN_ADDRESS
  );

  await oracle.waitForDeployment();
  const oracleAddress = await oracle.getAddress();

  console.log("RealEstateOracle deployed to:", oracleAddress);
  console.log("Router Address:", ROUTER_ADDRESS);
  console.log("DON ID:", DON_ID);
  console.log("Subscription ID:", SUBSCRIPTION_ID);
  console.log("RealEstateToken Address:", REAL_ESTATE_TOKEN_ADDRESS);

  // Verify the contract on Etherscan (optional)
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("Waiting for block confirmations...");
    await oracle.deploymentTransaction()?.wait(6);
    
    console.log("Verifying contract on Etherscan...");
    try {
      await run("verify:verify", {
        address: oracleAddress,
        constructorArguments: [
          ROUTER_ADDRESS,
          DON_ID,
          SUBSCRIPTION_ID,
          REAL_ESTATE_TOKEN_ADDRESS
        ],
      });
    } catch (error) {
      console.log("Error verifying contract:", error);
    }
  }

  return {
    oracle: oracleAddress,
    router: ROUTER_ADDRESS,
    donId: DON_ID,
    subscriptionId: SUBSCRIPTION_ID
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 