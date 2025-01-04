import { ethers } from "hardhat";
import { Contract } from "ethers";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy PropertyToken
  const PropertyToken = await ethers.getContractFactory("PropertyToken");
  const propertyToken = await PropertyToken.deploy();
  await propertyToken.waitForDeployment();
  console.log("PropertyToken deployed to:", await propertyToken.getAddress());

  // Deploy PropertyRegistry
  const PropertyRegistry = await ethers.getContractFactory("PropertyRegistry");
  const propertyRegistry = await PropertyRegistry.deploy();
  await propertyRegistry.waitForDeployment();
  console.log("PropertyRegistry deployed to:", await propertyRegistry.getAddress());

  // Deploy Marketplace
  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(await propertyToken.getAddress());
  await marketplace.waitForDeployment();
  console.log("Marketplace deployed to:", await marketplace.getAddress());

  // Deploy RentalIncomeDispenser
  const RentalIncomeDispenser = await ethers.getContractFactory("RentalIncomeDispenser");
  const rentalIncomeDispenser = await RentalIncomeDispenser.deploy(await propertyToken.getAddress());
  await rentalIncomeDispenser.waitForDeployment();
  console.log("RentalIncomeDispenser deployed to:", await rentalIncomeDispenser.getAddress());

  // Deploy UserRegistry
  const UserRegistry = await ethers.getContractFactory("UserRegistry");
  const userRegistry = await UserRegistry.deploy();
  await userRegistry.waitForDeployment();
  console.log("UserRegistry deployed to:", await userRegistry.getAddress());

  // Verify contracts
  if (process.env.NODE_ENV !== "test") {
    console.log("Verifying contracts...");
    await verifyContract(await propertyToken.getAddress(), []);
    await verifyContract(await propertyRegistry.getAddress(), []);
    await verifyContract(await marketplace.getAddress(), [await propertyToken.getAddress()]);
    await verifyContract(await rentalIncomeDispenser.getAddress(), [await propertyToken.getAddress()]);
    await verifyContract(await userRegistry.getAddress(), []);
  }

  console.log("Deployment and verification completed!");
}

async function verifyContract(address: string, constructorArguments: any[]) {
  try {
    await run("verify:verify", {
      address: address,
      constructorArguments: constructorArguments,
    });
  } catch (error) {
    console.error(`Verification failed for ${address}:`, error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});