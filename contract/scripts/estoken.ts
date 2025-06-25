import { ethers } from "hardhat";
import hre from "hardhat";

async function main() {
  // Get the current gas price and increase it
  const provider = ethers.provider;
  const gasPrice = await provider.getFeeData();
  const increasedGasPrice = gasPrice.maxFeePerGas 
    ? gasPrice.maxFeePerGas * BigInt(2) 
    : (gasPrice.gasPrice || BigInt(0)) * BigInt(2);

  console.log(`Using gas price: ${ethers.formatUnits(increasedGasPrice, 'gwei')} gwei`);

  // Deploy KYCManager
  const KYCManager = await ethers.getContractFactory("KYCManager");
  const kycManager = await KYCManager.deploy({
    maxFeePerGas: increasedGasPrice,
    maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas
  });
  await kycManager.waitForDeployment();
  const kycManagerAddress = await kycManager.getAddress();
  console.log("KYCManager deployed to:", kycManagerAddress);

  // Deploy RealEstateToken with KYCManager address
  const RealEstateToken = await ethers.getContractFactory("RealEstateToken");
  const realEstateToken = await RealEstateToken.deploy(
    kycManagerAddress, 
    {
      maxFeePerGas: increasedGasPrice,
      maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas
    }
  );
  await realEstateToken.waitForDeployment();
  const realEstateTokenAddress = await realEstateToken.getAddress();
  console.log("RealEstateToken deployed to:", realEstateTokenAddress);

  console.log("Waiting for block confirmations...");
  await kycManager.deploymentTransaction()?.wait(5);
  await realEstateToken.deploymentTransaction()?.wait(5);

  // Verify contracts
  console.log("Starting contract verification...");
  
  try {
    console.log("Verifying KYCManager...");
    await hre.run("verify:verify", {
      address: kycManagerAddress,
      constructorArguments: [],
    });
    console.log("KYCManager verified successfully!");
  } catch (error: any) {
    console.log("KYCManager verification failed:", error.message);
  }

  try {
    console.log("Verifying RealEstateToken...");
    await hre.run("verify:verify", {
      address: realEstateTokenAddress,
      constructorArguments: [kycManagerAddress],
    });
    console.log("RealEstateToken verified successfully!");
  } catch (error: any) {
    console.log("RealEstateToken verification failed:", error.message);
  }

  console.log("\n=== Deployment Summary ===");
  console.log(`KYCManager: ${kycManagerAddress}`);
  console.log(`RealEstateToken: ${realEstateTokenAddress}`);
  console.log("Estoken deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
