// scripts/deployProxy.ts
import { ethers, upgrades, run } from "hardhat";
import erc20Abi from "./erc20Abi.json";
import {deploy} from "@openzeppelin/hardhat-upgrades/dist/utils";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function main() {
    const [deployer, receiver, user, addr3, addr4, addr5, addr6, addr7, addr8, addr9, addr10, addressWithoutTokens,referrer,attacker] = await ethers.getSigners();


    console.log("Deploying contracts with the account:", deployer.address);

    const MultiTokenHighscore = await ethers.getContractFactory("MultiTokenHighscore");
    const highscore = await upgrades.deployProxy(MultiTokenHighscore, [deployer.address, 60, 10], { initializer: 'initialize' });

    await highscore.waitForDeployment();
    const highscoreAddress = await highscore.getAddress();

    console.log("MultiTokenHighscore deployed to:", highscoreAddress);
    // Wait a few seconds to ensure the contract is propagated
    console.log("Waiting for the contract to propagate...");
    await new Promise((resolve) => setTimeout(resolve, 60000)); // Wait 60 seconds

    const implementationAddress = await upgrades.erc1967.getImplementationAddress(highscoreAddress);
    console.log("Implementation contract address:", implementationAddress);
    console.log("Verifying the implementation contract on Etherscan or Basescan...");
    await run("verify:verify", {
        address: implementationAddress,
        constructorArguments: [],
    });
    console.log("Implementation contract verified successfully!");
    console.log(`Now verify manually the proxy navigating to\n\n https://basescan.io/proxycontractchecker?a=${highscoreAddress} \n\nShould match implementation on: ${implementationAddress}`)
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});