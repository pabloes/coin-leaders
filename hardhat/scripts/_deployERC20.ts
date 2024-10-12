import { ethers, upgrades, run } from "hardhat";
import pressAnyKey from "press-any-key";

export async function deployERC20Token({constructorArguments}){
    const [deployer] = await ethers.getSigners();

    console.log("Deploying ERC20 Mock contract with the account:", deployer.address);
    const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
    const tokenMockContract = await upgrades.deployProxy(ERC20Mock, constructorArguments, { initializer: "initialize" });

    await tokenMockContract.waitForDeployment();
    const tokenContractAddress = await tokenMockContract.getAddress();
    console.log("tokenMockContract proxy deployed to:", tokenContractAddress);
    const initialBalances = 10000; // Assign 2000 tokens to each address for testing
    // await tokenMockContract.connect(deployer).transfer(address2, initialBalances);
    // await tokenMockContract.connect(deployer).transfer(address3, initialBalances);
    // Wait a few seconds to ensure the contract is propagated
    console.log("Waiting for the contract to propagate...");
    await new Promise((resolve) => setTimeout(resolve, 60000)); // Wait 60 seconds

    const implementationAddress = await upgrades.erc1967.getImplementationAddress(tokenContractAddress);
    console.log("Implementation contract address:", implementationAddress);
    console.log("Verifying the implementation contract on Etherscan...");

    await run("verify:verify", {
        address: implementationAddress,
        constructorArguments:[],
    });
    console.log("Implementation contract verified successfully!");
    //  console.log(`npx hardhat verify --contract "contracts/MyNFTContract.sol --network sepolia ${highscoreAddress} --show-stack-traces`)
    /*console.log("Verifying the contract on Etherscan...");

    await run("verify:verify", {
        address: highscoreAddress,
        constructorArguments: [],
    });
    console.log("Proxy contract verified successfully!");*/

 //   await pressAnyKey();
    setTimeout(()=>{
        console.log(`Now verify manually the proxy navigating to\n\n https://sepolia.basescan.io/proxycontractchecker?a=${tokenContractAddress} \n\nShould match implementation on: ${implementationAddress}`);
    });
    return {
        implementationAddress,
        contractAddress:tokenContractAddress,
        contract:tokenMockContract
    }
}