import { ethers } from "hardhat"
import type { Contract } from "ethers"

async function deployAndVerify(contractName: string, constructorArguments: any[] = []): Promise<Contract> {
  console.log(`Deploying ${contractName}...`)
  const ContractFactory = await ethers.getContractFactory(contractName)
  const contract = await ContractFactory.deploy(...constructorArguments)
  await contract.waitForDeployment()
  console.log(`${contractName} deployed to: ${contract.target}`)

  try {
    await run("verify:verify", {
      address: contract.target,
      constructorArguments: constructorArguments,
    })
  } catch (error) {
    console.log(`Error deploying or verifying ${contractName}:`, error)
  }
  return contract
}

async function main() {
  try {
    // Deploy KYCManager contract
    const kycManager = await deployAndVerify("KYCManager")
    console.log("KYCManager contract deployed and verified successfully!")
    console.log("KYCManager address:", kycManager.target)

    // Deploy RealEstateToken contract with KYCManager address
    const realEstateToken = await deployAndVerify("RealEstateToken", [kycManager.target])
    console.log("RealEstateToken contract deployed and verified successfully!")
    console.log("RealEstateToken address:", realEstateToken.target)
  } catch (error) {
    console.error("Deployment or verification failed:", error)
    process.exitCode = 1
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})