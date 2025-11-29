import { expect } from "chai";
import { ethers } from "hardhat";
//import { YourContract } from "../typechain-types";

describe("YourContract (Monad Pages)", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployYourContractFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const YourContractFactory = await ethers.getContractFactory("YourContract");
    const yourContract = await YourContractFactory.deploy();

    return { yourContract, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right initial state", async function () {
      const { yourContract } = await deployYourContractFixture();
      // The initial page count should be 0.
      expect(await yourContract.getTotalPages()).to.equal(0);
    });
  });

  describe("deployPage", function () {
    it("Should successfully deploy a new page", async function () {
      const { yourContract, owner } = await deployYourContractFixture();
      const title = "My First Page";
      const contentChunks = ["<html><body>Hello World</body></html>"];
      const mimeType = "text/html";

      // Call the deployPage function and check for the event emission
      await expect(yourContract.deployPage(title, contentChunks, mimeType))
        .to.emit(yourContract, "PageDeployed")
        .withArgs(0, owner.address, title, contentChunks[0].length, mimeType); // Check event arguments

      // Verify contract state after deployment
      const totalPages = await yourContract.getTotalPages();
      expect(totalPages).to.equal(1);

      const page = await yourContract.getPage(0);
      expect(page.id).to.equal(0);
      expect(page.owner).to.equal(owner.address);
      expect(page.title).to.equal(title);
      expect(page.contentChunks[0]).to.equal(contentChunks[0]);
      expect(page.mimeType).to.equal(mimeType);
      expect(page.totalTips).to.equal(0);
    });

    it("Should fail if title is empty", async function () {
      const { yourContract } = await deployYourContractFixture();
      // Expect the transaction to be reverted with the specific error message
      await expect(yourContract.deployPage("", ["content"], "text/plain")).to.be.revertedWith("Title cannot be empty.");
    });

    it("Should fail if content is empty", async function () {
      const { yourContract } = await deployYourContractFixture();
      await expect(yourContract.deployPage("A Title", [], "text/plain")).to.be.revertedWith("Content cannot be empty.");
    });

    it("Should correctly handle multiple page deployments", async function () {
      const { yourContract, owner, otherAccount } = await deployYourContractFixture();

      // First deployment
      await yourContract.connect(owner).deployPage("Owner's Page", ["content1"], "text/plain");
      // Second deployment from another account
      await yourContract.connect(otherAccount).deployPage("Other's Page", ["content2"], "text/plain");

      expect(await yourContract.getTotalPages()).to.equal(2);

      const page1 = await yourContract.getPage(0);
      expect(page1.owner).to.equal(owner.address);
      expect(page1.title).to.equal("Owner's Page");

      const page2 = await yourContract.getPage(1);
      expect(page2.owner).to.equal(otherAccount.address);
      expect(page2.title).to.equal("Other's Page");
    });
  });

  describe("tip", function () {
    it("Should allow an account to send a tip to a page owner", async function () {
      const { yourContract, owner, otherAccount } = await deployYourContractFixture();
      await yourContract.connect(owner).deployPage("Tippable Page", ["content"], "text/plain");

      const tipAmount = ethers.parseEther("1.0"); // 1 ETH

      // Check owner's balance before the tip
      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);

      // Send the tip from otherAccount
      const tx = await yourContract.connect(otherAccount).tip(0, { value: tipAmount });
      await tx.wait(); // Wait for the transaction to be mined

      // Check owner's balance after the tip
      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
      expect(ownerBalanceAfter).to.equal(ownerBalanceBefore + tipAmount);

      // Check the page's totalTips state
      const page = await yourContract.getPage(0);
      expect(page.totalTips).to.equal(tipAmount);
    });

    it("Should emit a TipSent event", async function () {
      const { yourContract, owner, otherAccount } = await deployYourContractFixture();
      await yourContract.connect(owner).deployPage("Event Page", ["content"], "text/plain");
      const tipAmount = ethers.parseEther("0.5");

      await expect(yourContract.connect(otherAccount).tip(0, { value: tipAmount }))
        .to.emit(yourContract, "TipSent")
        .withArgs(0, otherAccount.address, tipAmount);
    });

    it("Should fail if tipping a non-existent page", async function () {
      const { yourContract, otherAccount } = await deployYourContractFixture();
      const tipAmount = ethers.parseEther("1.0");
      await expect(yourContract.connect(otherAccount).tip(999, { value: tipAmount })).to.be.revertedWith(
        "Page does not exist.",
      );
    });

    it("Should fail if tip amount is zero", async function () {
      const { yourContract, owner, otherAccount } = await deployYourContractFixture();
      await yourContract.connect(owner).deployPage("Zero Tip Page", ["content"], "text/plain");
      await expect(yourContract.connect(otherAccount).tip(0, { value: 0 })).to.be.revertedWith(
        "Tip amount must be greater than zero.",
      );
    });
  });

  describe("View Functions", function () {
    it("getAllPages should return pages in reverse chronological order", async function () {
      const { yourContract } = await deployYourContractFixture();

      // Deploy three pages
      await yourContract.deployPage("Page 0", ["c0"], "text/plain");
      await yourContract.deployPage("Page 1", ["c1"], "text/plain");
      await yourContract.deployPage("Page 2", ["c2"], "text/plain");

      const allPages = await yourContract.getAllPages();

      // The array should have 3 pages
      expect(allPages.length).to.equal(3);

      // The order should be 2, 1, 0 because it's newest first
      expect(allPages[0].title).to.equal("Page 2");
      expect(allPages[1].title).to.equal("Page 1");
      expect(allPages[2].title).to.equal("Page 0");
    });
  });
});
