import {ethers, run, upgrades} from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    const proxyAddress = "0xf9974d2f3988f237522cf587e020dc00f273aa60"; // Reemplaza con la dirección del proxy del contrato desplegado


    // Obtener el contrato a actualizar
    const MyERC1155TokenV2 = await ethers.getContractFactory("MyERC1155Token");
    const upgrade = await upgrades.upgradeProxy(proxyAddress, MyERC1155TokenV2);
    await upgrade.waitForDeployment();
    const upgradeAddress = await upgrade.getAddress();

    console.log("MyERC1155Token upgraded into:", upgradeAddress);
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
    console.log(`Now verify manually the proxy navigating to\n\n https://basescan.org/proxycontractchecker?a=${upgradeAddress} \n\nShould mathc implementation on: ${implementationAddress}`)

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
