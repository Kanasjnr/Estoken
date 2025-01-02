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
  });

  describe("URI", function () {
    it("Should set and get URI", async function () {
      const { propertyToken, owner } = await loadFixture(deployPropertyTokenFixture);
      await propertyToken.setURI(1, "https://example.com/token/1");
      expect(await propertyToken.uri(1)).to.equal("https://example.com/token/1");
    });

    it("Should only allow owner to set URI", async function () {
      const { propertyToken, addr1 } = await loadFixture(deployPropertyTokenFixture);
      await expect(propertyToken.connect(addr1).setURI(1, "https://example.com/token/1"))
        .to.be.revertedWithCustomError(propertyToken, "OwnableUnauthorizedAccount");
    });

    it("Should emit URI event when setting URI", async function () {
      const { propertyToken, owner } = await loadFixture(deployPropertyTokenFixture);
      await expect(propertyToken.setURI(1, "https://example.com/token/1"))
        .to.emit(propertyToken, "URI")
        .withArgs("https://example.com/token/1", 1);
    });
  });

 
 
});

