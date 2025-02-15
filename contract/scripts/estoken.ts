import { ethers } from "hardhat";

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
  console.log("KYCManager deployed to:", await kycManager.getAddress());

  // Deploy RealEstateToken with KYCManager address
  const RealEstateToken = await ethers.getContractFactory("RealEstateToken");
  const realEstateToken = await RealEstateToken.deploy(
    await kycManager.getAddress(), 
    {
      maxFeePerGas: increasedGasPrice,
      maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas
    }
  );
  await realEstateToken.waitForDeployment();
  console.log("RealEstateToken deployed to:", await realEstateToken.getAddress());

  console.log("Waiting for block confirmations...");
  await kycManager.deploymentTransaction()?.wait(5);
  await realEstateToken.deploymentTransaction()?.wait(5);

  console.log("Estoken deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
