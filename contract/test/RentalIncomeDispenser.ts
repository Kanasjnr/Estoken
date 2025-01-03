import { ethers } from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { RentalIncomeDispenser, PropertyToken } from "../typechain-types";

describe("RentalIncomeDispenser", function () {
  async function deployRentalIncomeDispenserFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const PropertyToken = await ethers.getContractFactory("PropertyToken");
    const propertyToken = await PropertyToken.deploy();
    const RentalIncomeDispenser = await ethers.getContractFactory("RentalIncomeDispenser");
    const rentalIncomeDispenser = await RentalIncomeDispenser.deploy(await propertyToken.getAddress());
    return { rentalIncomeDispenser, propertyToken, owner, addr1, addr2 };
  }

  describe("Deployment", function () {
    it("Should set the correct property token address", async function () {
      const { rentalIncomeDispenser, propertyToken } = await loadFixture(deployRentalIncomeDispenserFixture);
      expect(await rentalIncomeDispenser.propertyToken()).to.equal(await propertyToken.getAddress());
    });
  });

  describe("Distributing Rental Income", function () {
    it("Should distribute rental income and collect management fee", async function () {
      const { rentalIncomeDispenser, propertyToken, owner, addr1, addr2 } = await loadFixture(deployRentalIncomeDispenserFixture);
      await propertyToken.mint(await rentalIncomeDispenser.getAddress(), 100, "0x");
      const distributionAmount = ethers.parseEther("100");
      await rentalIncomeDispenser.distributeRentalIncome(1, { value: distributionAmount });
      
      const income = await rentalIncomeDispenser.rentalIncomes(1);
      const expectedNetAmount = distributionAmount * 98n / 100n; // 2% fee
      expect(income.totalAmount).to.equal(expectedNetAmount);
    });

    it("Should emit RentalIncomeReceived and FeesCollected events", async function () {
      const { rentalIncomeDispenser, propertyToken, owner, addr1, addr2 } = await loadFixture(deployRentalIncomeDispenserFixture);
      await propertyToken.mint(await rentalIncomeDispenser.getAddress(), 100, "0x");
      const distributionAmount = ethers.parseEther("100");
      const expectedNetAmount = distributionAmount * 98n / 100n; // 2% fee
      const expectedFee = distributionAmount * 2n / 100n; // 2% fee

      await expect(rentalIncomeDispenser.distributeRentalIncome(1, { value: distributionAmount }))
        .to.emit(rentalIncomeDispenser, "RentalIncomeReceived")
        .withArgs(1, expectedNetAmount)
        .and.to.emit(rentalIncomeDispenser, "FeesCollected")
        .withArgs(expectedFee);
    });

    it("Should revert if no ETH is sent", async function () {
      const { rentalIncomeDispenser } = await loadFixture(deployRentalIncomeDispenserFixture);
      await expect(rentalIncomeDispenser.distributeRentalIncome(1))
        .to.be.revertedWith("Must send some ETH");
    });

    it("Should revert if no tokens are minted for the property", async function () {
      const { rentalIncomeDispenser } = await loadFixture(deployRentalIncomeDispenserFixture);
      await expect(rentalIncomeDispenser.distributeRentalIncome(1, { value: ethers.parseEther("100") }))
        .to.be.revertedWith("No tokens minted for this property");
    });
  });

  describe("Claiming Income", function () {
    it("Should allow token holders to claim income", async function () {
      const { rentalIncomeDispenser, propertyToken, owner, addr1, addr2 } = await loadFixture(deployRentalIncomeDispenserFixture);
      await propertyToken.mint(await rentalIncomeDispenser.getAddress(), 100, "0x");
      await propertyToken.mint(addr1.address, 60, "0x");
      await propertyToken.mint(addr2.address, 40, "0x");
      await rentalIncomeDispenser.distributeRentalIncome(1, { value: ethers.parseEther("100") });
      await rentalIncomeDispenser.connect(addr1).claimIncome(1);
      expect(await rentalIncomeDispenser.getUnclaimedIncome(1, addr1.address)).to.equal(0n);
    });

    it("Should allow non-token holders to claim income", async function () {
      const { rentalIncomeDispenser, propertyToken, owner, addr1, addr2 } = await loadFixture(deployRentalIncomeDispenserFixture);
      await propertyToken.mint(await rentalIncomeDispenser.getAddress(), 100, "0x");
      await rentalIncomeDispenser.distributeRentalIncome(1, { value: ethers.parseEther("100") });
      await expect(rentalIncomeDispenser.connect(addr2).claimIncome(1)).to.not.be.reverted;
    });

    

    it("Should revert if no income to claim", async function () {
      const { rentalIncomeDispenser, propertyToken, addr1 } = await loadFixture(deployRentalIncomeDispenserFixture);
      await propertyToken.mint(await rentalIncomeDispenser.getAddress(), 100, "0x");
      await propertyToken.mint(addr1.address, 60, "0x");
      await expect(rentalIncomeDispenser.connect(addr1).claimIncome(1))
        .to.be.revertedWith("No income to claim");
    });

    it("Should allow claiming with zero unclaimed income", async function () {
      const { rentalIncomeDispenser, propertyToken, owner, addr1 } = await loadFixture(deployRentalIncomeDispenserFixture);
      await propertyToken.mint(await rentalIncomeDispenser.getAddress(), 100, "0x");
      await propertyToken.mint(addr1.address, 100, "0x");
      await rentalIncomeDispenser.distributeRentalIncome(1, { value: ethers.parseEther("100") });
      await rentalIncomeDispenser.connect(addr1).claimIncome(1);
      await expect(rentalIncomeDispenser.connect(addr1).claimIncome(1)).to.not.be.reverted;
    });
  });

  describe("Getting Unclaimed Income", function () {
    // it("Should return correct unclaimed income", async function () {
    //   const { rentalIncomeDispenser, propertyToken, owner, addr1, addr2 } = await loadFixture(deployRentalIncomeDispenserFixture);
    //   await propertyToken.mint(await rentalIncomeDispenser.getAddress(), 100, "0x");
    //   await propertyToken.mint(addr1.address, 60, "0x");
    //   await propertyToken.mint(addr2.address, 40, "0x");
    //   await rentalIncomeDispenser.distributeRentalIncome(1, { value: ethers.parseEther("100") });
    //   expect(await rentalIncomeDispenser.getUnclaimedIncome(1, addr1.address)).to.equal(ethers.parseEther("58.8")); // 60% of 98 ETH
    //   expect(await rentalIncomeDispenser.getUnclaimedIncome(1, addr2.address)).to.equal(ethers.parseEther("39.2")); // 40% of 98 ETH
    // });

    it("Should return 0 for non-token holders", async function () {
      const { rentalIncomeDispenser, propertyToken, owner, addr1, addr2 } = await loadFixture(deployRentalIncomeDispenserFixture);
      await propertyToken.mint(await rentalIncomeDispenser.getAddress(), 100, "0x");
      await propertyToken.mint(addr1.address, 100, "0x");
      await rentalIncomeDispenser.distributeRentalIncome(1, { value: ethers.parseEther("100") });
      expect(await rentalIncomeDispenser.getUnclaimedIncome(1, addr2.address)).to.equal(0);
    });
  });

  describe("Withdrawing Fees", function () {
    it("Should allow owner to withdraw fees", async function () {
      const { rentalIncomeDispenser, propertyToken, owner, addr1 } = await loadFixture(deployRentalIncomeDispenserFixture);
      await propertyToken.mint(await rentalIncomeDispenser.getAddress(), 100, "0x");
      await propertyToken.mint(addr1.address, 100, "0x");
      await rentalIncomeDispenser.distributeRentalIncome(1, { value: ethers.parseEther("100") });

      const initialOwnerBalance = await ethers.provider.getBalance(owner.address);
      await rentalIncomeDispenser.connect(owner).withdrawFees();
      const finalOwnerBalance = await ethers.provider.getBalance(owner.address);

      expect(finalOwnerBalance).to.be.gt(initialOwnerBalance);
    });

    it("Should revert if non-owner tries to withdraw fees", async function () {
      const { rentalIncomeDispenser, addr1 } = await loadFixture(deployRentalIncomeDispenserFixture);
      await expect(rentalIncomeDispenser.connect(addr1).withdrawFees())
        .to.be.revertedWithCustomError(rentalIncomeDispenser, "OwnableUnauthorizedAccount");
    });

    it("Should revert if there are no fees to withdraw", async function () {
      const { rentalIncomeDispenser, owner } = await loadFixture(deployRentalIncomeDispenserFixture);
      await expect(rentalIncomeDispenser.withdrawFees())
        .to.be.revertedWith("No fees to withdraw");
    });
  });

  describe("Updating Property Token Address", function () {
    it("Should allow owner to update property token address", async function () {
      const { rentalIncomeDispenser, owner } = await loadFixture(deployRentalIncomeDispenserFixture);
      const newAddress = ethers.Wallet.createRandom().address;
      await rentalIncomeDispenser.connect(owner).updatePropertyTokenAddress(newAddress);
      expect(await rentalIncomeDispenser.propertyToken()).to.equal(newAddress);
    });

    it("Should revert if non-owner tries to update property token address", async function () {
      const { rentalIncomeDispenser, addr1 } = await loadFixture(deployRentalIncomeDispenserFixture);
      const newAddress = ethers.Wallet.createRandom().address;
      await expect(rentalIncomeDispenser.connect(addr1).updatePropertyTokenAddress(newAddress))
        .to.be.revertedWithCustomError(rentalIncomeDispenser, "OwnableUnauthorizedAccount");
    });

    it("Should revert if trying to set invalid address", async function () {
      const { rentalIncomeDispenser, owner } = await loadFixture(deployRentalIncomeDispenserFixture);
      await expect(rentalIncomeDispenser.connect(owner).updatePropertyTokenAddress(ethers.ZeroAddress))
        .to.be.revertedWith("Invalid address");
    });
  });
});

