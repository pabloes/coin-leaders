import { ethers, upgrades, run } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying upgradeable ERC1155 contract with the account:", deployer.address);

    const MyERC1155Token = await ethers.getContractFactory("MyERC1155Token");
    const token = await upgrades.deployProxy(MyERC1155Token, [], { initializer: 'initialize' });
    await token.waitForDeployment();

    const tokenAddress = await token.getAddress();
    console.log("ERC1155 contract deployed to:", tokenAddress);

    console.log("Waiting for the contract to propagate...");
    await new Promise((resolve) => setTimeout(resolve, 60000)); // Wait 60 seconds

    const implementationAddress = await upgrades.erc1967.getImplementationAddress(tokenAddress);
    console.log("Implementation contract address:", implementationAddress);
    console.log("Verifying the implementation contract on Etherscan or Basescan...");
    await run("verify:verify", {
        address: implementationAddress,
        constructorArguments: [],
    });
    console.log("Implementation contract verified successfully!");
    console.log(`Now verify manually the proxy navigating to\n\n https://basescan.org/proxycontractchecker?a=${tokenAddress} \n\nShould match implementation on: ${implementationAddress}`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
