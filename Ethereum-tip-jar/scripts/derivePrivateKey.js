require("dotenv").config();
const { ethers } = require("ethers");

const mnemonic = process.env.MNEMONIC;

console.log("Loaded MNEMONIC:", mnemonic); // Debug line

if (!mnemonic) {
  console.error("Please set your MNEMONIC in the .env file.");
  process.exit(1);
}

try {
  const wallet = ethers.Wallet.fromMnemonic(mnemonic);
  console.log("Derived Private Key:", wallet.privateKey);
} catch (error) {
  console.error("Error deriving private key:", error.message);
}