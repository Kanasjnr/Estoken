import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  // Increase the gas price significantly
  const gasPrice = ethers.parseUnits("805", "gwei"); // Adjusted based on the error message

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Gas price (gwei):", gasPrice.toString());

  // Function to deploy a contract with retry logic
  async function deployContract(name: string, factory: any, ...args: any[]) {
    let attempts = 0;
    while (attempts < 3) {
      try {
        const contract = await factory.deploy(...args, { gasPrice });
        await contract.waitForDeployment();
        console.log(`${name} deployed to:`, contract.target);
        return contract;
      } catch (error) {
        console.error(`Error deploying ${name}:`, error);
        attempts++;
        if (attempts === 3) {
          throw error;
        }
        console.log(`Retrying deployment of ${name}...`);
      }
    }
  }

  try {
    // Deploy contracts
    const PropertyToken = await ethers.getContractFactory("PropertyToken");
    const propertyToken = await deployContract("PropertyToken", PropertyToken);

    const PropertyRegistry = await ethers.getContractFactory("PropertyRegistry");
    const propertyRegistry = await deployContract("PropertyRegistry", PropertyRegistry);

    const Marketplace = await ethers.getContractFactory("Marketplace");
    const marketplace = await deployContract("Marketplace", Marketplace, propertyToken.target);

    const RentalIncomeDispenser = await ethers.getContractFactory("RentalIncomeDispenser");
    const rentalIncomeDispenser = await deployContract("RentalIncomeDispenser", RentalIncomeDispenser, propertyToken.target);

    const UserRegistry = await ethers.getContractFactory("UserRegistry");
    const userRegistry = await deployContract("UserRegistry", UserRegistry);

    console.log("All contracts deployed successfully!");
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});