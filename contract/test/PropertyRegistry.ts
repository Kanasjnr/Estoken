import { ethers } from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { PropertyRegistry } from "../typechain-types";

describe("PropertyRegistry", function () {
  async function deployPropertyRegistryFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const PropertyRegistry = await ethers.getContractFactory("PropertyRegistry");
    const propertyRegistry = await PropertyRegistry.deploy();
    return { propertyRegistry, owner, addr1, addr2 };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { propertyRegistry, owner } = await loadFixture(deployPropertyRegistryFixture);
      expect(await propertyRegistry.owner()).to.equal(owner.address);
    });

    it("Should set the initial listing fee", async function () {
      const { propertyRegistry } = await loadFixture(deployPropertyRegistryFixture);
      expect(await propertyRegistry.listingFee()).to.equal(ethers.parseEther("0.1"));
    });
  });

  describe("Adding Properties", function () {
    it("Should add a property and collect listing fee", async function () {
      const { propertyRegistry, owner } = await loadFixture(deployPropertyRegistryFixture);
      const listingFee = await propertyRegistry.listingFee();
      await propertyRegistry.addProperty("Property 1", "Location 1", 1, { value: listingFee });
      const property = await propertyRegistry.getProperty(1);
      expect(property[0]).to.equal("Property 1");
      expect(property[1]).to.equal("Location 1");
      expect(property[2]).to.equal(1n);
      expect(property[3]).to.be.true;
    });

    it("Should emit PropertyAdded and FeesCollected events", async function () {
      const { propertyRegistry, owner } = await loadFixture(deployPropertyRegistryFixture);
      const listingFee = await propertyRegistry.listingFee();
      await expect(propertyRegistry.addProperty("Property 1", "Location 1", 1, { value: listingFee }))
        .to.emit(propertyRegistry, "PropertyAdded")
        .withArgs(1, "Property 1", "Location 1", 1)
        .and.to.emit(propertyRegistry, "FeesCollected")
        .withArgs(listingFee);
    });

    it("Should revert if listing fee is insufficient", async function () {
      const { propertyRegistry, owner } = await loadFixture(deployPropertyRegistryFixture);
      const insufficientFee = ethers.parseEther("0.05");
      await expect(propertyRegistry.addProperty("Property 1", "Location 1", 1, { value: insufficientFee }))
        .to.be.revertedWith("Insufficient listing fee");
    });

    it("Should only allow owner to add property", async function () {
      const { propertyRegistry, addr1 } = await loadFixture(deployPropertyRegistryFixture);
      const listingFee = await propertyRegistry.listingFee();
      await expect(propertyRegistry.connect(addr1).addProperty("Property 1", "Location 1", 1, { value: listingFee }))
        .to.be.revertedWithCustomError(propertyRegistry, "OwnableUnauthorizedAccount");
    });
  });

  describe("Updating Properties", function () {
    it("Should update a property", async function () {
      const { propertyRegistry, owner } = await loadFixture(deployPropertyRegistryFixture);
      const listingFee = await propertyRegistry.listingFee();
      await propertyRegistry.addProperty("Property 1", "Location 1", 1, { value: listingFee });
      await propertyRegistry.updateProperty(1, "Updated Property", "Updated Location", false);
      const property = await propertyRegistry.getProperty(1);
      expect(property[0]).to.equal("Updated Property");
      expect(property[1]).to.equal("Updated Location");
      expect(property[3]).to.be.false;
    });

    it("Should only allow owner to update property", async function () {
      const { propertyRegistry, owner, addr1 } = await loadFixture(deployPropertyRegistryFixture);
      const listingFee = await propertyRegistry.listingFee();
      await propertyRegistry.addProperty("Property 1", "Location 1", 1, { value: listingFee });
      await expect(propertyRegistry.connect(addr1).updateProperty(1, "Updated Property", "Updated Location", false))
        .to.be.revertedWithCustomError(propertyRegistry, "OwnableUnauthorizedAccount");
    });

    it("Should emit PropertyUpdated event", async function () {
      const { propertyRegistry, owner } = await loadFixture(deployPropertyRegistryFixture);
      const listingFee = await propertyRegistry.listingFee();
      await propertyRegistry.addProperty("Property 1", "Location 1", 1, { value: listingFee });
      await expect(propertyRegistry.updateProperty(1, "Updated Property", "Updated Location", false))
        .to.emit(propertyRegistry, "PropertyUpdated")
        .withArgs(1, "Updated Property", "Updated Location", false);
    });

    it("Should revert when updating non-existent property", async function () {
      const { propertyRegistry, owner } = await loadFixture(deployPropertyRegistryFixture);
      await expect(propertyRegistry.updateProperty(1, "Updated Property", "Updated Location", false))
        .to.be.revertedWith("Property does not exist");
    });
  });

  describe("Getting Properties", function () {
    it("Should get a property", async function () {
      const { propertyRegistry, owner } = await loadFixture(deployPropertyRegistryFixture);
      const listingFee = await propertyRegistry.listingFee();
      await propertyRegistry.addProperty("Property 1", "Location 1", 1, { value: listingFee });
      const property = await propertyRegistry.getProperty(1);
      expect(property[0]).to.equal("Property 1");
      expect(property[1]).to.equal("Location 1");
      expect(property[2]).to.equal(1n);
      expect(property[3]).to.be.true;
    });

    it("Should revert when getting non-existent property", async function () {
      const { propertyRegistry, owner } = await loadFixture(deployPropertyRegistryFixture);
      await expect(propertyRegistry.getProperty(1))
        .to.be.revertedWith("Property does not exist");
    });
  });

  describe("Updating Listing Fee", function () {
    it("Should allow owner to update listing fee", async function () {
      const { propertyRegistry, owner } = await loadFixture(deployPropertyRegistryFixture);
      const newFee = ethers.parseEther("0.2");
      await propertyRegistry.updateListingFee(newFee);
      expect(await propertyRegistry.listingFee()).to.equal(newFee);
    });

    it("Should emit ListingFeeUpdated event", async function () {
      const { propertyRegistry, owner } = await loadFixture(deployPropertyRegistryFixture);
      const newFee = ethers.parseEther("0.2");
      await expect(propertyRegistry.updateListingFee(newFee))
        .to.emit(propertyRegistry, "ListingFeeUpdated")
        .withArgs(newFee);
    });

    it("Should revert if non-owner tries to update listing fee", async function () {
      const { propertyRegistry, addr1 } = await loadFixture(deployPropertyRegistryFixture);
      const newFee = ethers.parseEther("0.2");
      await expect(propertyRegistry.connect(addr1).updateListingFee(newFee))
        .to.be.revertedWithCustomError(propertyRegistry, "OwnableUnauthorizedAccount");
    });
  });

  describe("Withdrawing Fees", function () {
    it("Should allow owner to withdraw fees", async function () {
      const { propertyRegistry, owner } = await loadFixture(deployPropertyRegistryFixture);
      const listingFee = await propertyRegistry.listingFee();
      await propertyRegistry.addProperty("Property 1", "Location 1", 1, { value: listingFee });

      const initialOwnerBalance = await ethers.provider.getBalance(owner.address);
      await propertyRegistry.withdrawFees();
      const finalOwnerBalance = await ethers.provider.getBalance(owner.address);

      expect(finalOwnerBalance).to.be.gt(initialOwnerBalance);
    });

    it("Should revert if non-owner tries to withdraw fees", async function () {
      const { propertyRegistry, addr1 } = await loadFixture(deployPropertyRegistryFixture);
      await expect(propertyRegistry.connect(addr1).withdrawFees())
        .to.be.revertedWithCustomError(propertyRegistry, "OwnableUnauthorizedAccount");
    });

    it("Should revert if there are no fees to withdraw", async function () {
      const { propertyRegistry, owner } = await loadFixture(deployPropertyRegistryFixture);
      await expect(propertyRegistry.withdrawFees())
        .to.be.revertedWith("No fees to withdraw");
    });
  });
});

