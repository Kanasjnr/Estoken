import { ethers, run } from "hardhat";

async function main() {
  console.log("Deploying RealEstateOracle contract...");

  const ROUTER_ADDRESS = "0xf9B8fc078197181C841c296C876945aaa425B278"; // base sepolia Functions Router
  const DON_ID = "0x66756e2d626173652d7365706f6c69612d310000000000000000000000000000"; //  DON ID
  const SUBSCRIPTION_ID = 349; 
  
  const REAL_ESTATE_TOKEN_ADDRESS = "0x67152ce69B4b522bc1e8FA676e3806C0B52dC059"; 

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
  if (process.env.BASESCAN_API_KEY) {
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