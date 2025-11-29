const hre = require("hardhat");

async function main() {
  // Get the contract factory
  const BuyMeACoffee = await hre.ethers.getContractFactory("BuyMeACoffee");
  
  // Deploy the contract
  console.log("Deploying BuyMeACoffee contract...");
  const buyMeACoffee = await BuyMeACoffee.deploy();
  
  // Wait for the contract to be deployed
  await buyMeACoffee.deployed();
  
  console.log("BuyMeACoffee deployed to:", buyMeACoffee.address);
  
  // Save the contract address and ABI to a file for frontend use
  const fs = require("fs");
  const contractsDir = "./utils";
  
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }
  
  fs.writeFileSync(
    contractsDir + "/BuyMeACoffee.json",
    JSON.stringify({
      address: buyMeACoffee.address,
      abi: JSON.parse(buyMeACoffee.interface.format('json'))
    }, null, 2)
  );
  
  console.log("Contract address and ABI saved to utils/BuyMeACoffee.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
