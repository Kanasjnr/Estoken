import { ethers } from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { PropertyToken } from "../typechain-types";

describe("PropertyToken", function () {
  async function deployPropertyTokenFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const PropertyToken = await ethers.getContractFactory("PropertyToken");
    const propertyToken = await PropertyToken.deploy();
    return { propertyToken, owner, addr1, addr2 };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { propertyToken, owner } = await loadFixture(deployPropertyTokenFixture);
      expect(await propertyToken.owner()).to.equal(owner.address);
    });
  });

  describe("Minting", function () {
    it("Should mint tokens", async function () {
      const { propertyToken, owner, addr1 } = await loadFixture(deployPropertyTokenFixture);
      await propertyToken.mint(addr1.address, 100, "0x");
      expect(await propertyToken.balanceOf(addr1.address, 1)).to.equal(100);
    });

    it("Should only allow owner to mint", async function () {
      const { propertyToken, addr1 } = await loadFixture(deployPropertyTokenFixture);
      await expect(propertyToken.connect(addr1).mint(addr1.address, 100, "0x"))
        .to.be.revertedWithCustomError(propertyToken, "OwnableUnauthorizedAccount");
    });

    it("Should increment token ID for each mint", async function () {
      const { propertyToken, owner, addr1, addr2 } = await loadFixture(deployPropertyTokenFixture);
      await propertyToken.mint(addr1.address, 100, "0x");
      await propertyToken.mint(addr2.address, 200, "0x");
      expect(await propertyToken.balanceOf(addr1.address, 1)).to.equal(100);
      expect(await propertyToken.balanceOf(addr2.address, 2)).to.equal(200);
    });

    it("Should emit TokenMinted event", async function () {
      const { propertyToken, owner, addr1 } = await loadFixture(deployPropertyTokenFixture);
      await expect(propertyToken.mint(addr1.address, 100, "0x"))
        .to.emit(propertyToken, "TokenMinted")
        .withArgs(addr1.address, 1, 100);
    });

    it("Should revert when minting to zero address", async function () {
      const { propertyToken, owner } = await loadFixture(deployPropertyTokenFixture);
      await expect(propertyToken.mint(ethers.ZeroAddress, 100, "0x"))
        .to.be.revertedWith("Mint to the zero address");
    });

    it("Should revert when minting zero amount", async function () {
      const { propertyToken, owner, addr1 } = await loadFixture(deployPropertyTokenFixture);
      await expect(propertyToken.mint(addr1.address, 0, "0x"))
        .to.be.revertedWith("Amount must be positive");
    });
  });

  describe("Batch Minting", function () {
    it("Should mint batch of tokens", async function () {
      const { propertyToken, owner, addr1 } = await loadFixture(deployPropertyTokenFixture);
      await propertyToken.mintBatch(addr1.address, [100, 200, 300], "0x");
      expect(await propertyToken.balanceOf(addr1.address, 1)).to.equal(100);
      expect(await propertyToken.balanceOf(addr1.address, 2)).to.equal(200);
      expect(await propertyToken.balanceOf(addr1.address, 3)).to.equal(300);
    });

    it("Should only allow owner to mint batch", async function () {
      const { propertyToken, addr1 } = await loadFixture(deployPropertyTokenFixture);
      await expect(propertyToken.connect(addr1).mintBatch(addr1.address, [100, 200], "0x"))
        .to.be.revertedWithCustomError(propertyToken, "OwnableUnauthorizedAccount");
    });

    it("Should emit TokenBatchMinted event", async function () {
      const { propertyToken, owner, addr1 } = await loadFixture(deployPropertyTokenFixture);
      await expect(propertyToken.mintBatch(addr1.address, [100, 200], "0x"))
        .to.emit(propertyToken, "TokenBatchMinted")
        .withArgs(addr1.address, [1, 2], [100, 200]);
    });

    it("Should revert when batch minting to zero address", async function () {
      const { propertyToken, owner } = await loadFixture(deployPropertyTokenFixture);
      await expect(propertyToken.mintBatch(ethers.ZeroAddress, [100, 200], "0x"))
        .to.be.revertedWith("Mint to the zero address");
    });

    it("Should revert when batch minting with zero amount", async function () {
      const { propertyToken, owner, addr1 } = await loadFixture(deployPropertyTokenFixture);
      await expect(propertyToken.mintBatch(addr1.address, [100, 0, 200], "0x"))
        .to.be.revertedWith("Amount must be positive");
    });
  });

  describe("URI", function () {
    it("Should set and get URI", async function () {
      const { propertyToken, owner } = await loadFixture(deployPropertyTokenFixture);
      await propertyToken.mint(owner.address, 100, "0x");
      await propertyToken.setURI(1, "https://example.com/token/1");
      expect(await propertyToken.uri(1)).to.equal("https://example.com/token/1");
    });

    it("Should only allow owner to set URI", async function () {
      const { propertyToken, owner, addr1 } = await loadFixture(deployPropertyTokenFixture);
      await propertyToken.mint(owner.address, 100, "0x");
      await expect(propertyToken.connect(addr1).setURI(1, "https://example.com/token/1"))
        .to.be.revertedWithCustomError(propertyToken, "OwnableUnauthorizedAccount");
    });

    it("Should emit URI event when setting URI", async function () {
      const { propertyToken, owner } = await loadFixture(deployPropertyTokenFixture);
      await propertyToken.mint(owner.address, 100, "0x");
      await expect(propertyToken.setURI(1, "https://example.com/token/1"))
        .to.emit(propertyToken, "URI")
        .withArgs("https://example.com/token/1", 1);
    });

    it("Should revert when setting URI for non-existent token", async function () {
      const { propertyToken, owner } = await loadFixture(deployPropertyTokenFixture);
      await expect(propertyToken.setURI(1, "https://example.com/token/1"))
        .to.be.revertedWith("URI set of nonexistent token");
    });

    it("Should return correct tokenURI", async function () {
      const { propertyToken, owner } = await loadFixture(deployPropertyTokenFixture);
      await propertyToken.mint(owner.address, 100, "0x");
      await propertyToken.setURI(1, "https://example.com/token/1");
      expect(await propertyToken.tokenURI(1)).to.equal("https://example.com/token/1");
    });

    it("Should return empty string for tokenURI if not set", async function () {
      const { propertyToken, owner } = await loadFixture(deployPropertyTokenFixture);
      await propertyToken.mint(owner.address, 100, "0x");
      expect(await propertyToken.tokenURI(1)).to.equal("");
    });

    it("Should revert when querying tokenURI for non-existent token", async function () {
      const { propertyToken } = await loadFixture(deployPropertyTokenFixture);
      await expect(propertyToken.tokenURI(1))
        .to.be.revertedWith("URI query for nonexistent token");
    });
  });

 
});

