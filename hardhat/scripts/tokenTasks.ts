import {deployERC20Token} from "./_deployERC20";
import {ethers} from "hardhat";
import highscoreAbi from "../../subgraph/coin-leaders/abis/MultiTokenHighscore.json";
import erc20Abi from "./erc20Abi.json";
import {Contract} from "ethers";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main(){
    const {
        DEPLOYED_SEPOLIA_CONTRACT_HIGHSCORE,
        DEPLOYED_SEPOLIA_CONTRACT_ERC20MOCK,
        DEPLOYED_SEPOLIA_CONTRACT_ERC20MOCK2,
        DEPLOYED_SEPOLIA_CONTRACT_ERC20MOCK3,
        DEPLOYED_SEPOLIA_CONTRACT_ERC20MOCK4,
        DEPLOYED_SEPOLIA_CONTRACT_ERC20MOCK5
    } = process.env;

    const [deployer, address1, address2, address3, address4, address5, address6, address7, address8, address9, address10, address11, address12] = await ethers.getSigners();
    const addresses = [address1, address2, address3, address4, address5, address6, address7, address8, address9, address10, address11, address12];



    const tokens = [];

   // await deployTokenContracts();
    await initTokenContracts();

    await ethTrasnferToAllAddresses();
    await tokenTransferToAllAddressesAndDepositHighScore();

    tokens.forEach((t)=>console.log(`ERC20 contract ${t.contractAddress}`));
    await sleep(1000);
    console.log("!");

    async function initTokenContracts(){
        console.log("initTokenContracts")
        let c = 4;
        const contracts = [
            {contract:new ethers.Contract(DEPLOYED_SEPOLIA_CONTRACT_ERC20MOCK, erc20Abi), contractAddress:DEPLOYED_SEPOLIA_CONTRACT_ERC20MOCK},
            {contract:new ethers.Contract(DEPLOYED_SEPOLIA_CONTRACT_ERC20MOCK2, erc20Abi), contractAddress: DEPLOYED_SEPOLIA_CONTRACT_ERC20MOCK2},
            {contract:new ethers.Contract(DEPLOYED_SEPOLIA_CONTRACT_ERC20MOCK3, erc20Abi), contractAddress: DEPLOYED_SEPOLIA_CONTRACT_ERC20MOCK3},
            {contract:new ethers.Contract(DEPLOYED_SEPOLIA_CONTRACT_ERC20MOCK4, erc20Abi), contractAddress: DEPLOYED_SEPOLIA_CONTRACT_ERC20MOCK4},
            {contract:new ethers.Contract(DEPLOYED_SEPOLIA_CONTRACT_ERC20MOCK5, erc20Abi), contractAddress: DEPLOYED_SEPOLIA_CONTRACT_ERC20MOCK5}
        ];
        while(c--){
            tokens.push(contracts[c])
        }
        console.log("initialized erc20 contracts", tokens.length)
    }

    async function deployTokenContracts(){
        let c = 4;
        while(c--){
            tokens.push(
                await deployERC20Token({
                    constructorArguments:["Token"+c,"TTK"+c,deployer.address, 999999999_999_999_999n]
                })
            );
        }
    }

    async function ethTrasnferToAllAddresses(){

        let c = addresses.length;
        while(c--){
            console.log("transferring eth", c);
            const tx = await deployer.sendTransaction({
                to: addresses[c].address,
                value:ethers.parseUnits("0.008", "ether"),
            });
            await tx.wait();
        }
    }

    async function tokenTransferToAllAddressesAndDepositHighScore(){
        console.log("tokenTransferToAllAddressesAndDepositHighScore")
        const highscoreContract = new ethers.Contract(DEPLOYED_SEPOLIA_CONTRACT_HIGHSCORE, highscoreAbi);;
        let c = 4;
        while(c--){
            let cc = addresses.length;

            while(cc--){
                console.log(`Doing transfer on contract ${c} to address ${cc}...`);
                const amount = 10+getRandomInt(1, 10)*cc+c;
                await tokens[c].contract.connect(deployer).transfer(addresses[cc], amount);

                //TODO allowance of already deployed highscore contract
                const approval = await tokens[c].contract.connect(addresses[cc]).approve(DEPLOYED_SEPOLIA_CONTRACT_HIGHSCORE, 1_000_000_000);
                await approval.wait();
                const referrerAddress = addresses[getRandomInt(0, addresses.length-1)].address;
                const addressesWithoutReferrer = addresses.filter(a=>a.address !== referrerAddress);

                const commAddress = addressesWithoutReferrer[getRandomInt(0, addressesWithoutReferrer.length-1)].address;

                console.log("referrerAddress",referrerAddress);
                console.log("commAddress",commAddress)
                console.log("amount",amount);

                try{
                    await highscoreContract.connect(addresses[cc]).deposit(
                        tokens[c].contractAddress,
                        amount,
                        "URL"+cc,
                        "TITLE"+cc,
                        "https://picsum.photos/600/200?r="+getRandomInt(1,10),
                        referrerAddress,
                        commAddress
                    );
                }catch(error){
                    console.error(error);
                }


                console.log("Done.")
            }
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

export function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
