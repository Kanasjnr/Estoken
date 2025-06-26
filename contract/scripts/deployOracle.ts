import { ethers, run } from "hardhat";

async function main() {
  console.log("🔮 Deploying Chainlink Functions Oracle...");
  console.log("=========================================");

  // Base Sepolia Chainlink Functions configuration
  const ROUTER_ADDRESS = "0xf9B8fc078197181C841c296C876945aaa425B278";
  const DON_ID = "0x66756e2d626173652d7365706f6c69612d310000000000000000000000000000";
  const SUBSCRIPTION_ID = 349;

  // Get existing RealEstateToken address
  const EXISTING_REAL_ESTATE_TOKEN = process.env.REAL_ESTATE_TOKEN_ADDRESS || "";
  
  if (!EXISTING_REAL_ESTATE_TOKEN) {
    console.log("❌ Please set REAL_ESTATE_TOKEN_ADDRESS environment variable");
    process.exit(1);
  }

  console.log("📋 Configuration:");
  console.log("- Functions Router:", ROUTER_ADDRESS);
  console.log("- DON ID:", DON_ID);
  console.log("- Subscription ID:", SUBSCRIPTION_ID);
  console.log("- RealEstateToken:", EXISTING_REAL_ESTATE_TOKEN);
  console.log("");

  // Deploy RealEstateOracle
  console.log("1️⃣ Deploying RealEstateOracle with Chainlink Functions...");
  const RealEstateOracle = await ethers.getContractFactory("RealEstateOracle");
  const oracle = await RealEstateOracle.deploy(
    ROUTER_ADDRESS,
    DON_ID,
    SUBSCRIPTION_ID,
    EXISTING_REAL_ESTATE_TOKEN
  );
  await oracle.waitForDeployment();
  const oracleAddress = await oracle.getAddress();
  console.log("✅ RealEstateOracle deployed to:", oracleAddress);

  // Test Oracle configuration
  console.log("");
  console.log("2️⃣ Testing Oracle configuration...");
  try {
    const subscriptionId = await oracle.s_subscriptionId();
    const gasLimit = await oracle.gasLimit();
    const donId = await oracle.donId();
    
    console.log("✅ Subscription ID:", subscriptionId.toString());
    console.log("✅ Gas Limit:", gasLimit.toString());
    console.log("✅ DON ID:", donId);
  } catch (error: any) {
    console.log("⚠️ Oracle configuration test failed:", error.message);
  }

  console.log("");
  console.log("📄 ORACLE DEPLOYMENT SUMMARY");
  console.log("===========================");
  console.log("🔮 RealEstateOracle:", oracleAddress);
  console.log("🔗 Functions Router:", ROUTER_ADDRESS);
  console.log("📡 Subscription ID:", SUBSCRIPTION_ID);
  console.log("");

  console.log("✅ NEW FEATURES AVAILABLE:");
  console.log("- Property valuation requests");
  console.log("- External API integration");
  console.log("- Real estate data fetching");
  console.log("- Automated property updates");
  console.log("");

  console.log("⚠️ REQUIRED SETUP STEPS:");
  console.log("1. Add Oracle as consumer to Chainlink Functions subscription:");
  console.log("   - Go to: https://functions.chain.link/");
  console.log("   - Select subscription ID:", SUBSCRIPTION_ID);
  console.log("   - Add consumer address:", oracleAddress);
  console.log("");
  console.log("2. Ensure subscription has sufficient LINK balance");
  console.log("3. Test valuation request with a sample property");
  console.log("");

  console.log("📱 FRONTEND INTEGRATION:");
  console.log("const oracle = new ethers.Contract(oracleAddress, oracleABI, signer);");
  console.log("await oracle.requestValuationUpdate(propertyId, location, size);");
  console.log("");


  // Verification
  if (process.env.BASESCAN_API_KEY) {
    console.log("");
    console.log("⏳ Waiting for block confirmations...");
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    try {
      console.log("🔍 Verifying contract...");
      await run("verify:verify", {
        address: oracleAddress,
        constructorArguments: [
          ROUTER_ADDRESS,
          DON_ID,
          SUBSCRIPTION_ID,
          EXISTING_REAL_ESTATE_TOKEN
        ],
      });
      console.log("✅ Contract verified!");
    } catch (error: any) {
      console.log("❌ Verification error:", error.message);
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