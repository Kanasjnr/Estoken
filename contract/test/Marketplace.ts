import { ethers } from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { Marketplace, PropertyToken } from "../typechain-types";

describe("Marketplace", function () {
  async function deployMarketplaceFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const PropertyToken = await ethers.getContractFactory("PropertyToken");
    const propertyToken = await PropertyToken.deploy();
    const Marketplace = await ethers.getContractFactory("Marketplace");
    const marketplace = await Marketplace.deploy(await propertyToken.getAddress());
    return { marketplace, propertyToken, owner, addr1, addr2 };
  }

  describe("Deployment", function () {
    it("Should set the correct property token address", async function () {
      const { marketplace, propertyToken } = await loadFixture(deployMarketplaceFixture);
      expect(await marketplace.propertyToken()).to.equal(await propertyToken.getAddress());
    });
  });

  describe("Creating Listings", function () {
    it("Should create a listing", async function () {
      const { marketplace, propertyToken, owner, addr1 } = await loadFixture(deployMarketplaceFixture);
      await propertyToken.mint(addr1.address, 100, "0x");
      await propertyToken.connect(addr1).setApprovalForAll(await marketplace.getAddress(), true);
      await marketplace.connect(addr1).createListing(1, 50, ethers.parseEther("1"));
      const listing = await marketplace.listings(1);
      expect(listing.seller).to.equal(addr1.address);
      expect(listing.tokenId).to.equal(1n);
      expect(listing.amount).to.equal(50n);
      expect(listing.pricePerToken).to.equal(ethers.parseEther("1"));
    });

    it("Should emit Listed event", async function () {
      const { marketplace, propertyToken, owner, addr1 } = await loadFixture(deployMarketplaceFixture);
      await propertyToken.mint(addr1.address, 100, "0x");
      await propertyToken.connect(addr1).setApprovalForAll(await marketplace.getAddress(), true);
      await expect(marketplace.connect(addr1).createListing(1, 50, ethers.parseEther("1")))
        .to.emit(marketplace, "Listed")
        .withArgs(1, addr1.address, 1, 50, ethers.parseEther("1"));
    });

    it("Should revert if amount is 0", async function () {
      const { marketplace, propertyToken, owner, addr1 } = await loadFixture(deployMarketplaceFixture);
      await propertyToken.mint(addr1.address, 100, "0x");
      await propertyToken.connect(addr1).setApprovalForAll(await marketplace.getAddress(), true);
      await expect(marketplace.connect(addr1).createListing(1, 0, ethers.parseEther("1")))
        .to.be.revertedWith("Amount must be greater than 0");
    });

    it("Should revert if price is 0", async function () {
      const { marketplace, propertyToken, owner, addr1 } = await loadFixture(deployMarketplaceFixture);
      await propertyToken.mint(addr1.address, 100, "0x");
      await propertyToken.connect(addr1).setApprovalForAll(await marketplace.getAddress(), true);
      await expect(marketplace.connect(addr1).createListing(1, 50, 0))
        .to.be.revertedWith("Price must be greater than 0");
    });
  });

  describe("Buying Tokens", function () {
    it("Should allow buying tokens and collect fees", async function () {
      const { marketplace, propertyToken, owner, addr1, addr2 } = await loadFixture(deployMarketplaceFixture);
      await propertyToken.mint(addr1.address, 100, "0x");
      await propertyToken.connect(addr1).setApprovalForAll(await marketplace.getAddress(), true);
      await marketplace.connect(addr1).createListing(1, 50, ethers.parseEther("1"));
      
      const initialBalance = await ethers.provider.getBalance(await marketplace.getAddress());
      await marketplace.connect(addr2).buyTokens(1, 25, { value: ethers.parseEther("25.5") });
      
      expect(await propertyToken.balanceOf(addr2.address, 1)).to.equal(25n);
      const fee = ethers.parseEther("0.5"); // 2% of 25 ETH
      expect(await ethers.provider.getBalance(await marketplace.getAddress())).to.equal(initialBalance + fee);
    });

    it("Should emit Sale event", async function () {
      const { marketplace, propertyToken, owner, addr1, addr2 } = await loadFixture(deployMarketplaceFixture);
      await propertyToken.mint(addr1.address, 100, "0x");
      await propertyToken.connect(addr1).setApprovalForAll(await marketplace.getAddress(), true);
      await marketplace.connect(addr1).createListing(1, 50, ethers.parseEther("1"));
      
      await expect(marketplace.connect(addr2).buyTokens(1, 25, { value: ethers.parseEther("25.5") }))
        .to.emit(marketplace, "Sale")
        .withArgs(1, addr2.address, 25);
    });

    it("Should emit FeesCollected event", async function () {
      const { marketplace, propertyToken, owner, addr1, addr2 } = await loadFixture(deployMarketplaceFixture);
      await propertyToken.mint(addr1.address, 100, "0x");
      await propertyToken.connect(addr1).setApprovalForAll(await marketplace.getAddress(), true);
      await marketplace.connect(addr1).createListing(1, 50, ethers.parseEther("1"));
      
      await expect(marketplace.connect(addr2).buyTokens(1, 25, { value: ethers.parseEther("25.5") }))
        .to.emit(marketplace, "FeesCollected")
        .withArgs(ethers.parseEther("0.5"));
    });

    it("Should revert if listing is not active", async function () {
      const { marketplace, propertyToken, owner, addr1, addr2 } = await loadFixture(deployMarketplaceFixture);
      await expect(marketplace.connect(addr2).buyTokens(1, 25, { value: ethers.parseEther("25.5") }))
        .to.be.revertedWith("Listing is not active");
    });

    it("Should revert if not enough tokens available", async function () {
      const { marketplace, propertyToken, owner, addr1, addr2 } = await loadFixture(deployMarketplaceFixture);
      await propertyToken.mint(addr1.address, 100, "0x");
      await propertyToken.connect(addr1).setApprovalForAll(await marketplace.getAddress(), true);
      await marketplace.connect(addr1).createListing(1, 50, ethers.parseEther("1"));
      await expect(marketplace.connect(addr2).buyTokens(1, 100, { value: ethers.parseEther("102") }))
        .to.be.revertedWith("Not enough tokens available");
    });

    it("Should revert if insufficient payment", async function () {
      const { marketplace, propertyToken, owner, addr1, addr2 } = await loadFixture(deployMarketplaceFixture);
      await propertyToken.mint(addr1.address, 100, "0x");
      await propertyToken.connect(addr1).setApprovalForAll(await marketplace.getAddress(), true);
      await marketplace.connect(addr1).createListing(1, 50, ethers.parseEther("1"));
      await expect(marketplace.connect(addr2).buyTokens(1, 25, { value: ethers.parseEther("24") }))
        .to.be.revertedWith("Insufficient payment");
    });
  });

  describe("Cancelling Listings", function () {
    it("Should allow seller to cancel listing", async function () {
      const { marketplace, propertyToken, owner, addr1 } = await loadFixture(deployMarketplaceFixture);
      await propertyToken.mint(addr1.address, 100, "0x");
      await propertyToken.connect(addr1).setApprovalForAll(await marketplace.getAddress(), true);
      await marketplace.connect(addr1).createListing(1, 50, ethers.parseEther("1"));
      await marketplace.connect(addr1).cancelListing(1);
      const listing = await marketplace.listings(1);
      expect(listing.isActive).to.be.false;
    });

    it("Should emit ListingCancelled event", async function () {
      const { marketplace, propertyToken, owner, addr1 } = await loadFixture(deployMarketplaceFixture);
      await propertyToken.mint(addr1.address, 100, "0x");
      await propertyToken.connect(addr1).setApprovalForAll(await marketplace.getAddress(), true);
      await marketplace.connect(addr1).createListing(1, 50, ethers.parseEther("1"));
      await expect(marketplace.connect(addr1).cancelListing(1))
        .to.emit(marketplace, "ListingCancelled")
        .withArgs(1);
    });

    it("Should revert if non-seller tries to cancel", async function () {
      const { marketplace, propertyToken, owner, addr1, addr2 } = await loadFixture(deployMarketplaceFixture);
      await propertyToken.mint(addr1.address, 100, "0x");
      await propertyToken.connect(addr1).setApprovalForAll(await marketplace.getAddress(), true);
      await marketplace.connect(addr1).createListing(1, 50, ethers.parseEther("1"));
      await expect(marketplace.connect(addr2).cancelListing(1))
        .to.be.revertedWith("Only seller can cancel listing");
    });

    it("Should revert if listing is not active", async function () {
      const { marketplace, propertyToken, owner, addr1 } = await loadFixture(deployMarketplaceFixture);
      await propertyToken.mint(addr1.address, 100, "0x");
      await propertyToken.connect(addr1).setApprovalForAll(await marketplace.getAddress(), true);
      await marketplace.connect(addr1).createListing(1, 50, ethers.parseEther("1"));
      await marketplace.connect(addr1).cancelListing(1);
      await expect(marketplace.connect(addr1).cancelListing(1))
        .to.be.revertedWith("Listing is not active");
    });
  });

  describe("Withdrawing Fees", function () {
    it("Should allow owner to withdraw fees", async function () {
      const { marketplace, propertyToken, owner, addr1, addr2 } = await loadFixture(deployMarketplaceFixture);
      await propertyToken.mint(addr1.address, 100, "0x");
      await propertyToken.connect(addr1).setApprovalForAll(await marketplace.getAddress(), true);
      await marketplace.connect(addr1).createListing(1, 50, ethers.parseEther("1"));
      await marketplace.connect(addr2).buyTokens(1, 25, { value: ethers.parseEther("25.5") });

      const initialOwnerBalance = await ethers.provider.getBalance(owner.address);
      await marketplace.connect(owner).withdrawFees();
      const finalOwnerBalance = await ethers.provider.getBalance(owner.address);

      expect(finalOwnerBalance).to.be.gt(initialOwnerBalance);
    });

    it("Should revert if non-owner tries to withdraw fees", async function () {
      const { marketplace, addr1 } = await loadFixture(deployMarketplaceFixture);
      await expect(marketplace.connect(addr1).withdrawFees())
        .to.be.revertedWithCustomError(marketplace, "OwnableUnauthorizedAccount");
    });
  });
});

