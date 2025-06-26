import { ethers, run } from "hardhat";

async function main() {
  console.log("🏠 Deploying Core Real Estate Platform...");
  console.log("========================================");

  // Step 1: Deploy KYCManager
  console.log("1️⃣ Deploying KYCManager...");
  const KYCManager = await ethers.getContractFactory("KYCManager");
  const kycManager = await KYCManager.deploy();
  await kycManager.waitForDeployment();
  const kycManagerAddress = await kycManager.getAddress();
  console.log("✅ KYCManager deployed to:", kycManagerAddress);

  // Step 2: Deploy RealEstateToken with Chainlink ETH/USD Price Feed
  console.log("2️⃣ Deploying RealEstateToken with Chainlink Data Feed...");
  
  // Base Sepolia ETH/USD Price Feed
  const ETH_USD_PRICE_FEED = "0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1";
  console.log("📊 Using ETH/USD Price Feed:", ETH_USD_PRICE_FEED);
  
  const RealEstateToken = await ethers.getContractFactory("RealEstateToken");
  const realEstateToken = await RealEstateToken.deploy(
    kycManagerAddress,
    ETH_USD_PRICE_FEED
  );
  await realEstateToken.waitForDeployment();
  const realEstateTokenAddress = await realEstateToken.getAddress();
  console.log("✅ RealEstateToken deployed to:", realEstateTokenAddress);

  // Step 3: Test the price feed integration
  console.log("3️⃣ Testing Chainlink Price Feed integration...");
  try {
    const latestPrice = await realEstateToken.getLatestETHPrice();
    console.log("✅ Current ETH/USD Price:", ethers.formatUnits(latestPrice, 8), "USD");
    
    // Test ETH calculation for a $100,000 property share
    const propertyValueUSD = ethers.parseEther("100000"); // $100k
    const ethRequired = await realEstateToken.calculateETHRequired(propertyValueUSD);
    console.log("✅ ETH required for $100k property:", ethers.formatEther(ethRequired), "ETH");
  } catch (error: any) {
    console.log("⚠️ Price feed test failed:", error.message);
    console.log("   This is normal if the price feed functions aren't implemented yet");
  }

  console.log("");
  console.log("📄 CORE DEPLOYMENT SUMMARY");
  console.log("=========================");
  console.log("🔐 KYCManager:", kycManagerAddress);
  console.log("🏘️ RealEstateToken:", realEstateTokenAddress);
  console.log("");

  console.log("✅ CORE FEATURES AVAILABLE:");
  console.log("- Property tokenization");
  console.log("- KYC verification");
  console.log("- Token trading");
  console.log("- Rental income distribution");
  console.log("- Dividend payments");
  console.log("- Real-time ETH/USD pricing");
  console.log("- Dynamic property pricing in ETH");
  console.log("");

  console.log("🔗 TO ADD MORE CHAINLINK FEATURES:");
  console.log("- Run deploy-functions-oracle.ts to add property valuations");
  console.log("- Run deploy-automation.ts to add auto-updates");

  // Verification
  if (process.env.BASESCAN_API_KEY) {
    console.log("");
    console.log("⏳ Waiting for block confirmations...");
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    try {
      console.log("🔍 Verifying contracts...");
      
      await run("verify:verify", {
        address: kycManagerAddress,
        constructorArguments: [],
      });
      
      await run("verify:verify", {
        address: realEstateTokenAddress,
        constructorArguments: [kycManagerAddress, ETH_USD_PRICE_FEED],
      });
      
      console.log("✅ Contracts verified!");
    } catch (error) {
      console.log("❌ Verification error:", error);
    }
  }

  return {
    kycManager: kycManagerAddress,
    realEstateToken: realEstateTokenAddress
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 