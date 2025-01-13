import { ethers, run } from "hardhat";

async function deployAndVerify(
  contractName: string,
  constructorArgs: any[] = []
) {
  try {
    console.log(`Deploying ${contractName}...`);
    const ContractFactory = await ethers.getContractFactory(contractName);
    const contract = await ContractFactory.deploy(...constructorArgs);
    await contract.waitForDeployment();
    console.log(`${contractName} deployed to: ${contract.target}`);

    // Verify the contract on Etherscan (if applicable)
    if (process.env.BASESCAN_API_KEY) {
      console.log(`Verifying ${contractName}...`);
      await run("verify:verify", {
        address: contract.target,
        constructorArguments: constructorArgs,
      });
    }

    return contract;
  } catch (error) {
    console.error(`Error deploying or verifying ${contractName}:`, error);
    throw error;
  }
}

async function main() {
  try {
    // Deploy contracts
    const propertyToken = await deployAndVerify("PropertyToken");
    const propertyRegistry = await deployAndVerify("PropertyRegistry");
    const marketplace = await deployAndVerify("Marketplace", [
      propertyToken.target,
    ]);
    const rentalIncomeDispenser = await deployAndVerify(
      "RentalIncomeDispenser",
      [propertyToken.target]
    );
    const userRegistry = await deployAndVerify("UserRegistry");

    console.log("All contracts deployed and verified successfully!");
  } catch (error) {
    console.error("Deployment or verification failed:", error);
    process.exitCode = 1;
  }
}

// Execute the deployment script
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
