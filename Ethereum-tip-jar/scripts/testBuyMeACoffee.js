const hre = require("hardhat");

async function main() {
  const contractAddress = "0x781b950309BB1BE8FD83453d2B31652a8bdb9658"; // <-- Replace with your contract address
  const BuyMeACoffee = await hre.ethers.getContractFactory("BuyMeACoffee");
  const contract = BuyMeACoffee.attach(contractAddress);

  // Get signer (sender)
  const [sender] = await hre.ethers.getSigners();
  console.log("Sender address:", sender.address);

  // Send a tip
  const tx = await contract.buyCoffee(
    "TerminalUser",
    "Testing from terminal!",
    { value: hre.ethers.utils.parseEther("0.01") }
  );
  await tx.wait();
  console.log("Sent a tip!");

  // Fetch memos
  const memos = await contract.getMemos();
  console.log("Memos:", memos);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});