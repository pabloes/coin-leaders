import {address} from "hardhat/internal/core/config/config-validation";

const {expect} = require("chai");
const {ethers, upgrades} = require("hardhat");
import { Contract,ContractFactory ,Signer} from "ethers";

describe("MultiTokenHighscore", function () {
    let MultiTokenHighscore: ContractFactory;
    let highscoreContract: Contract;
    let tokenMockContract: Contract;
    let tokenMockContract2: Contract;
    let owner: Signer;
    let receiver: Signer;
    let user: Signer;
    let addr3: Signer;
    let addr4: Signer;
    let addr5: Signer;
    let addr6: Signer;
    let addr7: Signer;
    let addr8: Signer;
    let addr9: Signer;
    let addr10: Signer;
    let referrer: Signer;
    let attacker: Signer;
    let addressWithoutTokens: Signer;

    before(async function () {
        [owner, receiver, user, addr3, addr4, addr5, addr6, addr7, addr8, addr9, addr10, addressWithoutTokens,referrer,attacker] = await ethers.getSigners();
        console.log("signers",  [owner, receiver, user, addr3, addr4, addr5, addr6, addr7, addr8, addr9, addr10, addressWithoutTokens,referrer,attacker].map(a=>a.address));

        // Deploy a mock ERC20 token for testing
        const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
        tokenMockContract = await upgrades.deployProxy(ERC20Mock, ["Test Token", "TTK", owner.address, 2000000000], { initializer: "initialize" });
        tokenMockContract2 = await upgrades.deployProxy(ERC20Mock, ["Test Token2", "TTK2", owner.address, 2000000000], { initializer: "initialize" });



        const initialBalances = 10000; // Assign 2000 tokens to each address for testing
        await tokenMockContract.transfer(receiver, initialBalances);
        await tokenMockContract.transfer(user, initialBalances);
        await tokenMockContract.transfer(addr3, initialBalances);
        await tokenMockContract.transfer(addr4, initialBalances);
        await tokenMockContract.transfer(addr5, initialBalances);
        await tokenMockContract.transfer(addr6, initialBalances);
        await tokenMockContract.transfer(addr7, initialBalances);
        await tokenMockContract.transfer(addr8, initialBalances);
        await tokenMockContract.transfer(addr9, initialBalances);
        await tokenMockContract.transfer(addr10, initialBalances);

        await tokenMockContract2.transfer(user, initialBalances);
    });

    beforeEach(async function () {
        MultiTokenHighscore = await ethers.getContractFactory("MultiTokenHighscore");
        highscoreContract = await upgrades.deployProxy(MultiTokenHighscore, [receiver.address, 60, 10], {initializer: "initialize"});
    });

    it("should allow users to deposit tokens with a URL and title", async function () {
        await tokenMockContract.connect(user).approve(highscoreContract, 200);
        await tokenMockContract2.connect(user).approve(highscoreContract, 200);

        await highscoreContract.connect(user).deposit(tokenMockContract, 100, "https://example.com/addr1", "title1", "img1","0x0000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000");
        await sleep(1000)
        await highscoreContract.connect(user).deposit(tokenMockContract, 100, "https://example.com/addr2", "title2","imag2","0x0000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000");
        expect(
            await highscoreContract.connect(user).deposit(tokenMockContract2, 100, "https://example.com/addr3", "title3","imag3","0x0000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000")
        ).to.emit(highscoreContract, "Deposit").and.to.emit(highscoreContract, "DepositInfo")
    });

    describe("Token Deposits with Referrals", function () {
        let tokenMock, amount;

        beforeEach(async function () {
            // Deploy a mock ERC20 token and distribute tokens
            const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
            tokenMock = await upgrades.deployProxy(ERC20Mock, ["Test Token", "TTK", owner.address, ethers.parseUnits("200000000", 18)], { initializer: "initialize" });
            //await tokenMock.deployed();

            // Transfer tokens to user
            amount = ethers.parseUnits("100", 18);
            console.log("amount",amount,amount.__proto__)
            await tokenMock.transfer(user, amount);
        });

        it("should distribute 60% of tokens to the referrer and 40% to the receiver", async function () {
            const referrerAmount = amount * 60n / 100n;
            const receiverAmount = amount - referrerAmount;

            // Approve tokens and perform deposit
            await tokenMock.connect(user).approve(highscoreContract, amount);

            await expect(highscoreContract.connect(user).deposit(tokenMock, amount, "url", "title", "img", referrer.address,"0x0000000000000000000000000000000000000000"))
                .to.emit(highscoreContract, "Deposit")
                .withArgs(user.address, await tokenMock.getAddress(), amount, referrer.address,"0x0000000000000000000000000000000000000000")
                .and.to.emit(highscoreContract, "DepositInfo").withArgs(user.address, await tokenMock.getAddress(),"url", "title", "img" );

            // Check balances
            expect(await tokenMock.balanceOf(referrer.address)).to.equal(referrerAmount);
            expect(await tokenMock.balanceOf(receiver.address)).to.equal(receiverAmount);
        });

        it("should send all tokens to the receiver if no referrer is provided", async function () {
            // Approve tokens and perform deposit
            await tokenMock.connect(user).approve(highscoreContract, amount);
            await expect(highscoreContract.connect(user).deposit(tokenMock, amount, "url", "title","img", "0x0000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000"))
                .to.emit(highscoreContract, "Deposit")
                .withArgs(user.address,await tokenMock.getAddress(), amount, "0x0000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000");

            // Check balance of receiver (should have 100% of the amount)
            expect(await tokenMock.balanceOf(receiver)).to.equal(amount);
        });
    });
    describe("ETH Deposits with Referrals", function () {

        /**
         * //TODO
         */

        it("should distribute 60% of ETH to the referrer and 40% to the receiver", async function () {
            const depositAmount = BigInt(ethers.parseUnits("1.0",18));
            const referrerAmount = depositAmount * (60n) / (100n);
            const receiverAmount = depositAmount - (referrerAmount);
const referrerBefore = await ethers.provider.getBalance(referrer.address);
const receiverBefore = await ethers.provider.getBalance(receiver.address);
            // Deposit ETH with referrer
            await expect(highscoreContract.connect(user).depositETH("url", "title","img", referrer.address,"0x0000000000000000000000000000000000000000",{ value: depositAmount }))
                .to.emit(highscoreContract, "Deposit")
                .withArgs(user.address, "0x0000000000000000000000000000000000000000", depositAmount, referrer.address,"0x0000000000000000000000000000000000000000");

            // Check balances
            expect(await ethers.provider.getBalance(referrer.address)).to.equal(referrerAmount+referrerBefore);
            expect(await ethers.provider.getBalance(receiver.address)).to.equal(receiverAmount+receiverBefore);
        });

        it("should send all ETH to the receiver if no referrer is provided", async function () {
            const depositAmount = ethers.parseUnits("1.0",18);
            const balanceBefore =  await ethers.provider.getBalance(receiver.address)
            // Deposit ETH without referrer
            await expect(highscoreContract.connect(user).depositETH("url", "title","img", "0x0000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000", { value: depositAmount }))
                .to.emit(highscoreContract, "Deposit")
                .withArgs(user.address, "0x0000000000000000000000000000000000000000",depositAmount,"0x0000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000");

            // Check balance of receiver (should have 100% of the deposit amount)
            expect(await ethers.provider.getBalance(receiver.address)).to.equal(depositAmount + balanceBefore);
        });
    });
    describe("withdrawERC20", function () {
        it("should allow the receiver to withdraw ERC20 tokens", async function () {
            await tokenMockContract.transfer(highscoreContract, 2);

            let contractBalance = await tokenMockContract.balanceOf(highscoreContract);

            expect(contractBalance).to.equal(2n);

            await highscoreContract.connect(receiver).withdrawERC20(tokenMockContract, 2, addressWithoutTokens);

            let receiverBalance = await tokenMockContract.balanceOf(addressWithoutTokens);

            expect(receiverBalance).to.equal(2n);

            contractBalance = await tokenMockContract.balanceOf(highscoreContract);

            expect(contractBalance).to.equal(0n);
        });

        it("should not allow others to withdraw ERC20 tokens", async function () {
            // Transfer some ERC20 tokens to the contract
            await tokenMockContract.transfer(highscoreContract, 2);

            // Try to withdraw the tokens with a different account
            await expect(
                highscoreContract.connect(user).withdrawERC20(tokenMockContract, 2, user)
            ).to.be.revertedWith("Not authorized");
        });
    });

    describe("ETH", function(){
        it("should ensure that the receiver receives ETH upon deposit and check user's ETH balance", async function () {
            const initialReceiverBalance = await ethers.provider.getBalance(await receiver.getAddress());
            const initialUserBalance = await ethers.provider.getBalance(await user.getAddress());

            // Deposit ETH to the contract
            const depositAmount = ethers.toBigInt(10);
            await highscoreContract.connect(user).depositETH(
                "testUrl",
                "testImage",
                "testTitle",
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000",
                { value: depositAmount }
            );

            const finalReceiverBalance = await ethers.provider.getBalance(await receiver.getAddress());
            expect(finalReceiverBalance).to.equal(initialReceiverBalance + depositAmount);

            const finalUserBalance = await ethers.provider.getBalance(await user.getAddress());
            expect(finalUserBalance).to.be.below(initialUserBalance - depositAmount); // Account for gas fees as well
        });
    });

    it("should emit MetaEvent", async ()=>{
        await expect(highscoreContract.connect(owner).emitMetaEvent(1n,"0x598f8af1565003AE7456DaC280a18ee826Df7a2c"))
            .to.emit(highscoreContract,"MetaEvent")

    })

});
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}