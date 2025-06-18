import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("🧑 Deployer address:", deployer.address);

  const LandRegistry = await ethers.getContractFactory("LandRegistry");
  const contract = await LandRegistry.deploy();

  await contract.waitForDeployment();
  const deployedAddress = await contract.getAddress();

  console.log("✅ LandRegistry deployed at:", deployedAddress);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
