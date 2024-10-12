// scripts/deployProxy.ts
import { ethers, upgrades, run } from "hardhat";
import {deployERC20Token} from "./_deployERC20";

async function main() {
    const [deployer] = await ethers.getSigners();
    await deployERC20Token({constructorArguments:["Test Token", "TTK", deployer.address, 2000000000]})
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});