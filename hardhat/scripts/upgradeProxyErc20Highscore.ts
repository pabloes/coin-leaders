import {ethers, run, upgrades} from "hardhat";
const fs = require('fs');

async function main() {
    // Read the proxy address from the file
    const proxyAddress = process.env.DEPLOYED_SEPOLIA_CONTRACT_HIGHSCORE;

    const MultiTokenHighscoreV2 = await ethers.getContractFactory("MultiTokenHighscore");
    console.log("Upgrading MultiTokenHighscore...");
    const upgrade = await upgrades.upgradeProxy(proxyAddress, MultiTokenHighscoreV2);
    console.log("MultiTokenHighscore upgraded");

    await upgrade.waitForDeployment();
    const upgradeAddress = await upgrade.getAddress();
    console.log("MultiTokenHighscore upgraded into:", upgradeAddress);
    // Wait a few seconds to ensure the contract is propagated
    console.log("Waiting for the contract to propagate...");
    await new Promise((resolve) => setTimeout(resolve, 60000)); // Wait 60 seconds

    const implementationAddress = await upgrades.erc1967.getImplementationAddress(upgradeAddress);
    console.log("Implementation contract address:", implementationAddress);
    console.log("Verifying the implementation contract on Etherscan...");
    await run("verify:verify", {
        address: implementationAddress,
        constructorArguments: [],
    });
    console.log("Implementation contract verified successfully!");
    console.log(`Now verify manually the proxy navigating to\n\n https://sepolia.basescan.io/proxycontractchecker?a=${upgradeAddress} \n\nShould mathc implementation on: ${implementationAddress}`)

}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });