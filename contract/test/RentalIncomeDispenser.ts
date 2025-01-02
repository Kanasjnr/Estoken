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
    it("Should distribute rental income", async function () {
      const { rentalIncomeDispenser, propertyToken, owner, addr1, addr2 } = await loadFixture(deployRentalIncomeDispenserFixture);
      await propertyToken.mint(addr1.address, 60, "0x");
      await propertyToken.mint(addr2.address, 40, "0x");
      await rentalIncomeDispenser.distributeRentalIncome(1, { value: ethers.parseEther("100") });
      const income = await rentalIncomeDispenser.rentalIncomes(1);
      expect(income.totalAmount).to.equal(ethers.parseEther("100"));
    });

    it("Should emit RentalIncomeReceived event", async function () {
      const { rentalIncomeDispenser, propertyToken, owner, addr1, addr2 } = await loadFixture(deployRentalIncomeDispenserFixture);
      await propertyToken.mint(addr1.address, 60, "0x");
      await propertyToken.mint(addr2.address, 40, "0x");
      await expect(rentalIncomeDispenser.distributeRentalIncome(1, { value: ethers.parseEther("100") }))
        .to.emit(rentalIncomeDispenser, "RentalIncomeReceived")
        .withArgs(1, ethers.parseEther("100"));
    });

    it("Should revert if no ETH is sent", async function () {
      const { rentalIncomeDispenser, propertyToken, owner, addr1, addr2 } = await loadFixture(deployRentalIncomeDispenserFixture);
      await expect(rentalIncomeDispenser.distributeRentalIncome(1))
        .to.be.revertedWith("Must send some ETH");
    });
  });

  describe("Claiming Income", function () {
    it("Should allow token holders to claim income", async function () {
      const { rentalIncomeDispenser, propertyToken, owner, addr1, addr2 } = await loadFixture(deployRentalIncomeDispenserFixture);
      await propertyToken.mint(addr1.address, 60, "0x");
      await propertyToken.mint(addr2.address, 40, "0x");
      await rentalIncomeDispenser.distributeRentalIncome(1, { value: ethers.parseEther("100") });
      await rentalIncomeDispenser.connect(addr1).claimIncome(1);
      expect(await rentalIncomeDispenser.getUnclaimedIncome(1, addr1.address)).to.equal(0n);
    });

    it("Should emit IncomeClaimed event", async function () {
      const { rentalIncomeDispenser, propertyToken, owner, addr1, addr2 } = await loadFixture(deployRentalIncomeDispenserFixture);
      await propertyToken.mint(addr1.address, 60, "0x");
      await propertyToken.mint(addr2.address, 40, "0x");
      await rentalIncomeDispenser.distributeRentalIncome(1, { value: ethers.parseEther("100") });
      await expect(rentalIncomeDispenser.connect(addr1).claimIncome(1))
        .to.emit(rentalIncomeDispenser, "IncomeClaimed")
        .withArgs(1, addr1.address, ethers.parseEther("60"));
    });

    it("Should revert if no income to claim", async function () {
      const { rentalIncomeDispenser, propertyToken, owner, addr1, addr2 } = await loadFixture(deployRentalIncomeDispenserFixture);
      await propertyToken.mint(addr1.address, 60, "0x");
      await expect(rentalIncomeDispenser.connect(addr1).claimIncome(1))
        .to.be.revertedWith("No income to claim");
    });

    it("Should revert if user doesn't own tokens", async function () {
      const { rentalIncomeDispenser, propertyToken, owner, addr1, addr2 } = await loadFixture(deployRentalIncomeDispenserFixture);
      await propertyToken.mint(addr1.address, 100, "0x");
      await rentalIncomeDispenser.distributeRentalIncome(1, { value: ethers.parseEther("100") });
      await expect(rentalIncomeDispenser.connect(addr2).claimIncome(1))
        .to.be.revertedWith("Must own tokens to claim income");
    });

    it("Should revert if no unclaimed income", async function () {
      const { rentalIncomeDispenser, propertyToken, owner, addr1, addr2 } = await loadFixture(deployRentalIncomeDispenserFixture);
      await propertyToken.mint(addr1.address, 100, "0x");
      await rentalIncomeDispenser.distributeRentalIncome(1, { value: ethers.parseEther("100") });
      await rentalIncomeDispenser.connect(addr1).claimIncome(1);
      await expect(rentalIncomeDispenser.connect(addr1).claimIncome(1))
        .to.be.revertedWith("No unclaimed income");
    });
  });

  describe("Getting Unclaimed Income", function () {
    it("Should return correct unclaimed income", async function () {
      const { rentalIncomeDispenser, propertyToken, owner, addr1, addr2 } = await loadFixture(deployRentalIncomeDispenserFixture);
      await propertyToken.mint(addr1.address, 60, "0x");
      await propertyToken.mint(addr2.address, 40, "0x");
      await rentalIncomeDispenser.distributeRentalIncome(1, { value: ethers.parseEther("100") });
      expect(await rentalIncomeDispenser.getUnclaimedIncome(1, addr1.address)).to.equal(ethers.parseEther("60"));
      expect(await rentalIncomeDispenser.getUnclaimedIncome(1, addr2.address)).to.equal(ethers.parseEther("40"));
    });
  });
});

