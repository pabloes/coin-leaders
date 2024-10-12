// scripts/deployProxy.ts
import { ethers, upgrades, run } from "hardhat";
import {abi as highscoreAbi} from "../artifacts/contracts/MultiTokenHighscore.sol/MultiTokenHighscore.json";
import dotenv from "dotenv";
dotenv.config({path:"../../.env"});
console.log("process.env.DEPLOYED_SEPOLIA_CONTRACT_HIGHSCORE",process.env.DEPLOYED_SEPOLIA_CONTRACT_HIGHSCORE);

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Verifying contracts with the account:", deployer.address);

    const highscore = new ethers.Contract(process.env.DEPLOYED_SEPOLIA_CONTRACT_HIGHSCORE, highscoreAbi) //await upgrades.deployProxy(MultiTokenHighscore, [deployer.address, 60, 10], { initializer: 'initialize' });
    const highscoreAddress = await highscore.getAddress();
    console.log("MultiTokenHighscore was deployed to:", highscoreAddress);

    const implementationAddress = await upgrades.erc1967.getImplementationAddress(highscoreAddress);
    console.log("Implementation contract address:", implementationAddress);
    console.log("Verifying the implementation contract on Etherscan...");
    await run("verify:verify", {
        address: implementationAddress,
        constructorArguments: [],
    });
    console.log("Implementation contract verified successfully!");
    console.log(`Now verify manually the proxy navigating to\n\n https://sepolia.etherscan.io/proxycontractchecker?a=${highscoreAddress} \n\nShould mathc implementation on: ${implementationAddress}`)



}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});