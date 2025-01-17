import { ethers, run } from "hardhat";

async function deployAndVerify(
  contractName: string,
  constructorArgs: any[] = []
) {
  try {
    console.log(`Deploying ${contractName}...`);
    const ContractFactory = await ethers.getContractFactory(contractName);
    const contract = await ContractFactory.deploy(...constructorArgs);
    await contract.waitForDeployment(); // Wait for deployment to be mined
    console.log(`${contractName} deployed to: ${contract.target}`);

    // Verify the contract after deployment
    await verifyContract(contract.target, constructorArgs);

    return contract;
  } catch (error) {
    console.error(`Error deploying or verifying ${contractName}:`, error);
    throw error;
  }
}

async function verifyContract(address: string, constructorArgs: any[]) {
  console.log("Verifying contract...");
  try {
    await run("verify:verify", {
      address,
      constructorArguments: constructorArgs,
    });
    console.log("Contract verified successfully!");
  } catch (error) {
    console.error("Contract verification failed:", error);
  }
}

async function main() {
  try {
    // Deploy RealEstateToken contract
    const realEstateToken = await deployAndVerify("RealEstateToken");

    console.log("RealEstateToken contract deployed and verified successfully!");
    console.log("Contract address:", realEstateToken.target);
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
