import { ethers } from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { UserRegistry } from "../typechain-types";

describe("UserRegistry", function () {
  async function deployUserRegistryFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const UserRegistry = await ethers.getContractFactory("UserRegistry");
    const userRegistry = await UserRegistry.deploy();
    return { userRegistry, owner, addr1, addr2 };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { userRegistry, owner } = await loadFixture(deployUserRegistryFixture);
      expect(await userRegistry.owner()).to.equal(owner.address);
    });
  });

  describe("User Registration", function () {
    it("Should register a new user", async function () {
      const { userRegistry, addr1 } = await loadFixture(deployUserRegistryFixture);
      await userRegistry.connect(addr1).registerUser();
      const user = await userRegistry.users(addr1.address);
      expect(user.isRegistered).to.be.true;
    });

    it("Should emit UserRegistered event", async function () {
      const { userRegistry, addr1 } = await loadFixture(deployUserRegistryFixture);
      await expect(userRegistry.connect(addr1).registerUser())
        .to.emit(userRegistry, "UserRegistered")
        .withArgs(addr1.address);
    });

    it("Should revert if user is already registered", async function () {
      const { userRegistry, addr1 } = await loadFixture(deployUserRegistryFixture);
      await userRegistry.connect(addr1).registerUser();
      await expect(userRegistry.connect(addr1).registerUser())
        .to.be.revertedWith("User already registered");
    });
  });

  describe("KYC Approval", function () {
    it("Should approve KYC for a registered user", async function () {
      const { userRegistry, owner, addr1 } = await loadFixture(deployUserRegistryFixture);
      await userRegistry.connect(addr1).registerUser();
      await userRegistry.approveKYC(addr1.address, "kycHash123");
      const user = await userRegistry.users(addr1.address);
      expect(user.isKYCApproved).to.be.true;
      expect(await userRegistry.getUserKYCHash(addr1.address)).to.equal("kycHash123");
    });

    it("Should emit KYCApproved event", async function () {
      const { userRegistry, owner, addr1 } = await loadFixture(deployUserRegistryFixture);
      await userRegistry.connect(addr1).registerUser();
      await expect(userRegistry.approveKYC(addr1.address, "kycHash123"))
        .to.emit(userRegistry, "KYCApproved")
        .withArgs(addr1.address);
    });

    it("Should revert if user is not registered", async function () {
      const { userRegistry, owner, addr1 } = await loadFixture(deployUserRegistryFixture);
      await expect(userRegistry.approveKYC(addr1.address, "kycHash123"))
        .to.be.revertedWith("User not registered");
    });

    it("Should only allow owner to approve KYC", async function () {
      const { userRegistry, addr1, addr2 } = await loadFixture(deployUserRegistryFixture);
      await userRegistry.connect(addr1).registerUser();
      await expect(userRegistry.connect(addr2).approveKYC(addr1.address, "kycHash123"))
        .to.be.revertedWithCustomError(userRegistry, "OwnableUnauthorizedAccount");
    });
  });

  describe("KYC Revocation", function () {
    it("Should revoke KYC for an approved user", async function () {
      const { userRegistry, owner, addr1 } = await loadFixture(deployUserRegistryFixture);
      await userRegistry.connect(addr1).registerUser();
      await userRegistry.approveKYC(addr1.address, "kycHash123");
      await userRegistry.revokeKYC(addr1.address);
      const user = await userRegistry.users(addr1.address);
      expect(user.isKYCApproved).to.be.false;
    });

    it("Should emit KYCRevoked event", async function () {
      const { userRegistry, owner, addr1 } = await loadFixture(deployUserRegistryFixture);
      await userRegistry.connect(addr1).registerUser();
      await userRegistry.approveKYC(addr1.address, "kycHash123");
      await expect(userRegistry.revokeKYC(addr1.address))
        .to.emit(userRegistry, "KYCRevoked")
        .withArgs(addr1.address);
    });

    it("Should revert if user is not KYC approved", async function () {
      const { userRegistry, owner, addr1 } = await loadFixture(deployUserRegistryFixture);
      await userRegistry.connect(addr1).registerUser();
      await expect(userRegistry.revokeKYC(addr1.address))
        .to.be.revertedWith("User not KYC approved");
    });

    it("Should only allow owner to revoke KYC", async function () {
      const { userRegistry, owner, addr1, addr2 } = await loadFixture(deployUserRegistryFixture);
      await userRegistry.connect(addr1).registerUser();
      await userRegistry.approveKYC(addr1.address, "kycHash123");
      await expect(userRegistry.connect(addr2).revokeKYC(addr1.address))
        .to.be.revertedWithCustomError(userRegistry, "OwnableUnauthorizedAccount");
    });
  });

  describe("KYC Status Check", function () {
    it("Should return correct KYC status", async function () {
      const { userRegistry, owner, addr1 } = await loadFixture(deployUserRegistryFixture);
      await userRegistry.connect(addr1).registerUser();
      expect(await userRegistry.isUserKYCApproved(addr1.address)).to.be.false;
      await userRegistry.approveKYC(addr1.address, "kycHash123");
      expect(await userRegistry.isUserKYCApproved(addr1.address)).to.be.true;
    });
  });

  describe("KYC Hash Retrieval", function () {
    it("Should return correct KYC hash for approved user", async function () {
      const { userRegistry, owner, addr1 } = await loadFixture(deployUserRegistryFixture);
      await userRegistry.connect(addr1).registerUser();
      await userRegistry.approveKYC(addr1.address, "kycHash123");
      expect(await userRegistry.getUserKYCHash(addr1.address)).to.equal("kycHash123");
    });

    it("Should revert if user is not KYC approved", async function () {
      const { userRegistry, owner, addr1 } = await loadFixture(deployUserRegistryFixture);
      await userRegistry.connect(addr1).registerUser();
      await expect(userRegistry.getUserKYCHash(addr1.address))
        .to.be.revertedWith("User not KYC approved");
    });
  });
});

