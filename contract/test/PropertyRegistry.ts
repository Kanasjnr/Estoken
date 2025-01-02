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
  });

  describe("Adding Properties", function () {
    it("Should add a property", async function () {
      const { propertyRegistry, owner } = await loadFixture(deployPropertyRegistryFixture);
      await propertyRegistry.addProperty("Property 1", "Location 1", 1);
      const property = await propertyRegistry.getProperty(1);
      expect(property[0]).to.equal("Property 1");
      expect(property[1]).to.equal("Location 1");
      expect(property[2]).to.equal(1n);
      expect(property[3]).to.be.true;
    });

    it("Should only allow owner to add property", async function () {
      const { propertyRegistry, addr1 } = await loadFixture(deployPropertyRegistryFixture);
      await expect(propertyRegistry.connect(addr1).addProperty("Property 1", "Location 1", 1))
        .to.be.revertedWithCustomError(propertyRegistry, "OwnableUnauthorizedAccount");
    });

    it("Should emit PropertyAdded event", async function () {
      const { propertyRegistry, owner } = await loadFixture(deployPropertyRegistryFixture);
      await expect(propertyRegistry.addProperty("Property 1", "Location 1", 1))
        .to.emit(propertyRegistry, "PropertyAdded")
        .withArgs(1, "Property 1", "Location 1", 1);
    });
  });

  describe("Updating Properties", function () {
    it("Should update a property", async function () {
      const { propertyRegistry, owner } = await loadFixture(deployPropertyRegistryFixture);
      await propertyRegistry.addProperty("Property 1", "Location 1", 1);
      await propertyRegistry.updateProperty(1, "Updated Property", "Updated Location", false);
      const property = await propertyRegistry.getProperty(1);
      expect(property[0]).to.equal("Updated Property");
      expect(property[1]).to.equal("Updated Location");
      expect(property[3]).to.be.false;
    });

    it("Should only allow owner to update property", async function () {
      const { propertyRegistry, owner, addr1 } = await loadFixture(deployPropertyRegistryFixture);
      await propertyRegistry.addProperty("Property 1", "Location 1", 1);
      await expect(propertyRegistry.connect(addr1).updateProperty(1, "Updated Property", "Updated Location", false))
        .to.be.revertedWithCustomError(propertyRegistry, "OwnableUnauthorizedAccount");
    });

    it("Should emit PropertyUpdated event", async function () {
      const { propertyRegistry, owner } = await loadFixture(deployPropertyRegistryFixture);
      await propertyRegistry.addProperty("Property 1", "Location 1", 1);
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
      await propertyRegistry.addProperty("Property 1", "Location 1", 1);
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
});

