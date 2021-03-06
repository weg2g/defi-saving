import { BigNumber } from "bignumber.js";
import { MockChainLinkAggregatorInstance } from "../../../types/truffle-contracts/index.d";
import * as t from "../../../types/truffle-contracts/index";
import { TestEngine } from "../../../test-helpers/TestEngine";
import { savAccBalVerify } from "../../../test-helpers/lib/lib";

var chai = require("chai");
var expect = chai.expect;
var tokenData = require("../../../test-helpers/tokenData.json");

const { BN, expectRevert } = require("@openzeppelin/test-helpers");
const MockCToken: t.MockCTokenContract = artifacts.require("MockCToken");

const ERC20: t.MockErc20Contract = artifacts.require("MockERC20");
const MockChainLinkAggregator: t.MockChainLinkAggregatorContract =
    artifacts.require("MockChainLinkAggregator");

contract("SavingAccount.borrow", async (accounts) => {
    const ETH_ADDRESS: string = "0x000000000000000000000000000000000000000E";
    const addressZero: string = "0x0000000000000000000000000000000000000000";
    let testEngine: TestEngine;
    let savingAccount: t.SavingAccountWithControllerInstance;
    let accountsContract: t.AccountsInstance;
    let bank: t.BankInstance;
    let tokenRegistry: t.TokenRegistryInstance;

    const owner = accounts[0];
    const user1 = accounts[1];
    const user2 = accounts[2];
    const user3 = accounts[3];
    const dummy = accounts[9];
    const eighteenPrecision = new BN(10).pow(new BN(18));
    const sixPrecision = new BN(10).pow(new BN(6));
    const eightPrecision = new BN(10).pow(new BN(8));
    let tokens: any;
    let mockChainlinkAggregators: any;
    let addressDAI: any;
    let addressUSDC: any;
    let addressUSDT: any;
    let addressTUSD: any;
    let addressMKR: any;
    let addressWBTC: any;
    let addressLP: any;
    let mockChainlinkAggregatorforDAIAddress: any;
    let mockChainlinkAggregatorforUSDCAddress: any;
    let mockChainlinkAggregatorforUSDTAddress: any;
    let mockChainlinkAggregatorforTUSDAddress: any;
    let mockChainlinkAggregatorforMKRAddress: any;
    let mockChainlinkAggregatorforWBTCAddress: any;
    let mockChainlinkAggregatorforETHAddress: any;
    let mockChainlinkAggregatorforFIN_LPAddress: any;
    let cDAI_addr: any;
    let cUSDC_addr: any;
    let cUSDT_addr: any;
    let cWBTC_addr: any;

    let cDAI: t.MockCTokenInstance;
    let cUSDC: t.MockCTokenInstance;
    let cUSDT: t.MockCTokenInstance;
    let cWBTC: t.MockCTokenInstance;

    let erc20DAI: t.MockErc20Instance;
    let erc20USDC: t.MockErc20Instance;
    let erc20MKR: t.MockErc20Instance;
    let erc20TUSD: t.MockErc20Instance;
    let erc20USDT: t.MockErc20Instance;
    let erc20WBTC: t.MockErc20Instance;
    let erc20LP: t.MockErc20Instance;
    let mockChainlinkAggregatorforDAI: t.MockChainLinkAggregatorInstance;
    let mockChainlinkAggregatorforUSDC: t.MockChainLinkAggregatorInstance;
    let mockChainlinkAggregatorforUSDT: t.MockChainLinkAggregatorInstance;
    let mockChainlinkAggregatorforTUSD: t.MockChainLinkAggregatorInstance;
    let mockChainlinkAggregatorforWBTC: t.MockChainLinkAggregatorInstance;

    let mockChainlinkAggregatorforMKR: t.MockChainLinkAggregatorInstance;
    let mockChainlinkAggregatorforETH: t.MockChainLinkAggregatorInstance;
    let mockChainlinkAggregatorforFIN_LP: t.MockChainLinkAggregatorInstance;
    let numOfToken: any;
    let ONE_DAI: any;
    let ONE_USDC: any;

    before(function () {
        // Things to initialize before all test
        this.timeout(0);
        testEngine = new TestEngine();
        // testEngine.deploy("scriptFlywheel.scen");
    });

    beforeEach(async function () {
        this.timeout(0);
        savingAccount = await testEngine.deploySavingAccount();
        // 1. initialization.
        tokens = await testEngine.erc20Tokens;
        mockChainlinkAggregators = await testEngine.mockChainlinkAggregators;
        accountsContract = await testEngine.accounts;
        bank = await testEngine.bank;
        tokenRegistry = testEngine.tokenInfoRegistry;

        addressDAI = tokens[0];
        addressUSDC = tokens[1];
        addressUSDT = tokens[2];
        addressTUSD = tokens[3];
        addressMKR = tokens[4];
        addressWBTC = tokens[8];
        addressLP = tokens[10];

        mockChainlinkAggregatorforDAIAddress = mockChainlinkAggregators[0];
        mockChainlinkAggregatorforUSDCAddress = mockChainlinkAggregators[1];
        mockChainlinkAggregatorforUSDTAddress = mockChainlinkAggregators[2];
        mockChainlinkAggregatorforTUSDAddress = mockChainlinkAggregators[3];
        mockChainlinkAggregatorforMKRAddress = mockChainlinkAggregators[4];
        mockChainlinkAggregatorforWBTCAddress = mockChainlinkAggregators[8];
        mockChainlinkAggregatorforETHAddress = mockChainlinkAggregators[9];
        mockChainlinkAggregatorforFIN_LPAddress = mockChainlinkAggregators[10];

        erc20WBTC = await ERC20.at(addressWBTC);
        erc20DAI = await ERC20.at(addressDAI);
        erc20USDC = await ERC20.at(addressUSDC);
        erc20USDT = await ERC20.at(addressUSDT);
        erc20TUSD = await ERC20.at(addressTUSD);
        erc20MKR = await ERC20.at(addressMKR);
        erc20LP = await ERC20.at(addressLP);

        cWBTC_addr = await testEngine.tokenInfoRegistry.getCToken(addressWBTC);
        cDAI_addr = await testEngine.tokenInfoRegistry.getCToken(addressDAI);
        cUSDC_addr = await testEngine.tokenInfoRegistry.getCToken(addressUSDC);
        cUSDT_addr = await testEngine.tokenInfoRegistry.getCToken(addressUSDT);

        cDAI = await MockCToken.at(cDAI_addr);
        cUSDC = await MockCToken.at(cUSDC_addr);
        cUSDT = await MockCToken.at(cUSDT_addr);
        cWBTC = await MockCToken.at(cWBTC_addr);

        mockChainlinkAggregatorforDAI = await MockChainLinkAggregator.at(
            mockChainlinkAggregatorforDAIAddress
        );
        mockChainlinkAggregatorforUSDC = await MockChainLinkAggregator.at(
            mockChainlinkAggregatorforUSDCAddress
        );
        mockChainlinkAggregatorforUSDT = await MockChainLinkAggregator.at(
            mockChainlinkAggregatorforUSDTAddress
        );
        mockChainlinkAggregatorforTUSD = await MockChainLinkAggregator.at(
            mockChainlinkAggregatorforTUSDAddress
        );
        mockChainlinkAggregatorforMKR = await MockChainLinkAggregator.at(
            mockChainlinkAggregatorforMKRAddress
        );
        mockChainlinkAggregatorforETH = await MockChainLinkAggregator.at(
            mockChainlinkAggregatorforETHAddress
        );
        mockChainlinkAggregatorforFIN_LP = await MockChainLinkAggregator.at(
            mockChainlinkAggregatorforFIN_LPAddress
        );
        mockChainlinkAggregatorforWBTC = await MockChainLinkAggregator.at(
            mockChainlinkAggregatorforWBTCAddress
        );

        ONE_DAI = eighteenPrecision;
        ONE_USDC = sixPrecision;
        // Set DAI, USDC, USDT, TUSD to the same price for convenience
        let DAIprice = await mockChainlinkAggregatorforDAI.latestAnswer();
        await mockChainlinkAggregatorforUSDC.updateAnswer(DAIprice);
        await mockChainlinkAggregatorforUSDT.updateAnswer(DAIprice);
        await mockChainlinkAggregatorforTUSD.updateAnswer(DAIprice);
        await mockChainlinkAggregatorforFIN_LP.updateAnswer(DAIprice);
        await savingAccount.fastForward(1);
    });

    // extra tests by Yichun
    context("Additional tests for Borrow", async () => {
        context("With multiple tokens", async () => {
            context(
                "Use compound supported and unsupported tokens together (WBTC, TUSD)",
                async () => {
                    context("Should fail", async () => {
                        it("Deposits WBTC, borrows TUSD and the collateral is not enough", async function () {
                            this.timeout(0);
                            /*
                             * Step 1. Assign tokens to each user and deposit them to DeFiner
                             * Account1: deposits 1 WBTC
                             * Account2: deposits 100 TUSD
                             */
                            await erc20WBTC.transfer(user1, eightPrecision.mul(new BN(1000)));
                            await erc20TUSD.transfer(user2, eighteenPrecision.mul(new BN(100)));

                            await erc20WBTC.approve(
                                savingAccount.address,
                                eightPrecision.mul(new BN(1000)),
                                { from: user1 }
                            );
                            await erc20TUSD.approve(
                                savingAccount.address,
                                eighteenPrecision.mul(new BN(100)),
                                { from: user2 }
                            );

                            await savingAccount.fastForward(1000);

                            await savingAccount.deposit(
                                addressWBTC,
                                eightPrecision.mul(new BN(1000)),
                                { from: user1 }
                            );
                            await savingAccount.deposit(
                                addressTUSD,
                                eighteenPrecision.mul(new BN(100)),
                                { from: user2 }
                            );
                            /*
                             * Step 2. Assign tokens to each user and deposit them to DeFiner
                             * Account1: Borrows more TUSD than its borrowing power, should fail
                             * To verify:
                             * 1. Fail at borrowing
                             */
                            let WBTCPrice = await mockChainlinkAggregatorforWBTC.latestAnswer();
                            let TUSDPrice = await mockChainlinkAggregatorforTUSD.latestAnswer();

                            let borrow = eighteenPrecision.mul(WBTCPrice).div(TUSDPrice);

                            const result = await tokenRegistry.getTokenInfoFromAddress(addressWBTC);
                            const wbtcTokenIndex = result[0];
                            await accountsContract.methods["setCollateral(uint8,bool)"](
                                wbtcTokenIndex,
                                true,
                                { from: user1 }
                            );
                            await expectRevert(
                                savingAccount.borrow(addressTUSD, borrow, { from: user1 }),
                                "Lack of liquidity when borrow."
                            );
                        });
                        it("Deposits TUSD, borrows WBTC and the collateral is not enough", async function () {
                            this.timeout(0);
                            /*
                             * Step 1. Assign tokens to each user and deposit them to DeFiner
                             * Account1: deposits 100 WBTC
                             * Account2: deposits 1 TUSD
                             */
                            await erc20WBTC.transfer(user1, eightPrecision.mul(new BN(100)));
                            await erc20TUSD.transfer(user2, eighteenPrecision.mul(new BN(1)));

                            await erc20WBTC.approve(
                                savingAccount.address,
                                eightPrecision.mul(new BN(100)),
                                { from: user1 }
                            );
                            await erc20TUSD.approve(
                                savingAccount.address,
                                eighteenPrecision.mul(new BN(1)),
                                { from: user2 }
                            );

                            await savingAccount.deposit(
                                addressWBTC,
                                eightPrecision.mul(new BN(100)),
                                { from: user1 }
                            );
                            await savingAccount.deposit(
                                addressTUSD,
                                eighteenPrecision.mul(new BN(1)),
                                { from: user2 }
                            );
                            /*
                             * Step 2. Assign tokens to each user and deposit them to DeFiner
                             * Account11 Borrows more WBTC than its borrowing power, should fail
                             * To verify:
                             * 1. Fail at borrowing
                             */
                            let WBTCPrice = await mockChainlinkAggregatorforWBTC.latestAnswer();
                            let TUSDPrice = await mockChainlinkAggregatorforTUSD.latestAnswer();
                            let borrow = eightPrecision.mul(TUSDPrice).div(WBTCPrice);
                            await expectRevert(
                                savingAccount.borrow(addressWBTC, borrow, { from: user2 }),
                                "Insufficient collateral when borrow"
                            );
                        });
                        it("Deposits WBTC, borrows TUSD and the amount is zero", async function () {
                            this.timeout(0);
                            /*
                             * Step 1. Assign tokens to each user and deposit them to DeFiner
                             * Account1: deposits 1 WBTC
                             * Account2: deposits 100 TUSD
                             */
                            await erc20WBTC.transfer(user1, eightPrecision.mul(new BN(1)));
                            await erc20TUSD.transfer(user2, eighteenPrecision.mul(new BN(100)));

                            await erc20WBTC.approve(
                                savingAccount.address,
                                eightPrecision.mul(new BN(1)),
                                { from: user1 }
                            );
                            await erc20TUSD.approve(
                                savingAccount.address,
                                eighteenPrecision.mul(new BN(100)),
                                { from: user2 }
                            );

                            await savingAccount.deposit(
                                addressWBTC,
                                eightPrecision.mul(new BN(1)),
                                { from: user1 }
                            );
                            await savingAccount.deposit(
                                addressTUSD,
                                eighteenPrecision.mul(new BN(100)),
                                { from: user2 }
                            );
                            /*
                             * Step 2. Assign tokens to each user and deposit them to DeFiner
                             * Account1: Borrows 0 TUSD
                             * To verify:
                             * 1. Fail at borrowing
                             */
                            let WBTCPrice = await mockChainlinkAggregatorforWBTC.latestAnswer();
                            let TUSDPrice = await mockChainlinkAggregatorforTUSD.latestAnswer();
                            let borrow = new BN(0);
                            await expectRevert(
                                savingAccount.borrow(addressTUSD, borrow, { from: user1 }),
                                "Borrow zero amount of token is not allowed."
                            );
                        });
                        it("Deposits TUSD, borrows WBTC and the amount is zero", async function () {
                            this.timeout(0);
                            /*
                             * Step 1. Assign tokens to each user and deposit them to DeFiner
                             * Account1: deposits 100 WBTC
                             * Account2: deposits 1 TUSD
                             */
                            await erc20WBTC.transfer(user1, eightPrecision.mul(new BN(100)));
                            await erc20TUSD.transfer(user2, eighteenPrecision.mul(new BN(1)));

                            await erc20WBTC.approve(
                                savingAccount.address,
                                eightPrecision.mul(new BN(100)),
                                { from: user1 }
                            );
                            await erc20TUSD.approve(
                                savingAccount.address,
                                eighteenPrecision.mul(new BN(1)),
                                { from: user2 }
                            );

                            await savingAccount.deposit(
                                addressWBTC,
                                eightPrecision.mul(new BN(100)),
                                { from: user1 }
                            );
                            await savingAccount.deposit(
                                addressTUSD,
                                eighteenPrecision.mul(new BN(1)),
                                { from: user2 }
                            );
                            /*
                             * Step 2. Assign tokens to each user and deposit them to DeFiner
                             * Account11 Borrows 0 WBTC
                             * To verify:
                             * 1. Fail at borrowing
                             */
                            let WBTCPrice = await mockChainlinkAggregatorforWBTC.latestAnswer();
                            let TUSDPrice = await mockChainlinkAggregatorforTUSD.latestAnswer();
                            let borrow = new BN(0);
                            await expectRevert(
                                savingAccount.borrow(addressWBTC, borrow, { from: user2 }),
                                "Borrow zero amount of token is not allowed."
                            );
                        });
                    });
                    context("Should succeeed", async () => {
                        it("Deposits WBTC, borrows a small amount of TUSD ", async function () {
                            this.timeout(0);
                            /*
                             * Step 1. Assign tokens to each user and deposit them to DeFiner
                             * Account1: deposits 1 WBTC
                             * Account2: deposits 100 TUSD
                             */
                            await erc20WBTC.transfer(user1, eightPrecision.mul(new BN(1)));
                            await erc20TUSD.transfer(user2, eighteenPrecision.mul(new BN(100)));

                            await erc20WBTC.approve(
                                savingAccount.address,
                                eightPrecision.mul(new BN(1)),
                                { from: user1 }
                            );
                            await erc20TUSD.approve(
                                savingAccount.address,
                                eighteenPrecision.mul(new BN(100)),
                                { from: user2 }
                            );

                            const savingsCompoundWBTCBeforeDeposit = new BN(
                                await cWBTC.balanceOfUnderlying.call(savingAccount.address)
                            );

                            await savingAccount.deposit(
                                addressWBTC,
                                eightPrecision.mul(new BN(1)),
                                { from: user1 }
                            );

                            await savingAccount.deposit(
                                addressTUSD,
                                eighteenPrecision.mul(new BN(100)),
                                { from: user2 }
                            );

                            const savingsCompoundWBTCAfterDeposit = new BN(
                                await cWBTC.balanceOfUnderlying.call(savingAccount.address)
                            );

                            /*
                             * Step 2. Assign tokens to each user and deposit them to DeFiner
                             * Account1: Borrows 10 TUSD
                             * To verify:
                             * 1. Account1 increases 10 TUSD
                             * 2. After deposit, 85% WBTC from savings goes to Compound
                             * 3. After borrowing, the amount of WBTC that savings deposits to Compound doesn't change
                             */
                            let WBTCPrice = await mockChainlinkAggregatorforWBTC.latestAnswer();
                            let TUSDPrice = await mockChainlinkAggregatorforTUSD.latestAnswer();
                            let borrow = new BN(10);

                            const user1TUSDBefore = await erc20TUSD.balanceOf(user1);

                            await savingAccount.borrow(addressTUSD, borrow, { from: user1 });

                            const savingsCompoundWBTCAfterBorrow = new BN(
                                await cWBTC.balanceOfUnderlying.call(savingAccount.address)
                            );

                            const user1TUSDAfter = await erc20TUSD.balanceOf(user1);

                            expect(
                                BN(user1TUSDAfter).sub(BN(user1TUSDBefore))
                            ).to.be.bignumber.equals(borrow);

                            expect(
                                savingsCompoundWBTCAfterDeposit.sub(
                                    savingsCompoundWBTCBeforeDeposit
                                )
                            ).to.be.bignumber.equals(
                                eightPrecision.mul(new BN(1)).mul(new BN(85)).div(new BN(100))
                            );

                            expect(
                                savingsCompoundWBTCAfterBorrow.sub(savingsCompoundWBTCAfterDeposit)
                            ).to.be.bignumber.equals(new BN(0));
                        });

                        it("Deposits TUSD, borrows a small amount of WBTC ", async function () {
                            this.timeout(0);
                            /*
                             * Step 1. Assign tokens to each user and deposit them to DeFiner
                             * Account1: deposits 1 WBTC
                             * Account2: deposits 100 TUSD
                             */
                            await erc20WBTC.transfer(user1, eightPrecision.mul(new BN(1)));
                            await erc20TUSD.transfer(user2, eighteenPrecision.mul(new BN(100)));

                            await erc20WBTC.approve(
                                savingAccount.address,
                                eightPrecision.mul(new BN(1)),
                                { from: user1 }
                            );
                            await erc20TUSD.approve(
                                savingAccount.address,
                                eighteenPrecision.mul(new BN(100)),
                                { from: user2 }
                            );

                            const savingsCompoundWBTCBeforeDeposit = new BN(
                                await cWBTC.balanceOfUnderlying.call(savingAccount.address)
                            );

                            await savingAccount.deposit(
                                addressWBTC,
                                eightPrecision.mul(new BN(1)),
                                { from: user1 }
                            );
                            await savingAccount.deposit(
                                addressTUSD,
                                eighteenPrecision.mul(new BN(100)),
                                { from: user2 }
                            );

                            const savingsCompoundWBTCAfterDeposit = new BN(
                                await cWBTC.balanceOfUnderlying.call(savingAccount.address)
                            );

                            /*
                             * Step 2. Assign tokens to each user and deposit them to DeFiner
                             * Account2: Borrows 1 WBTC
                             * To verify:
                             * 1. Account2 increases 1 WBTC
                             * 2. After deposit, 85% WBTC from savings goes to Compound
                             * 3. After borrowing, the amount of WBTC that savings deposits to Compound doesn't change
                             */
                            let WBTCPrice = await mockChainlinkAggregatorforWBTC.latestAnswer();
                            let TUSDPrice = await mockChainlinkAggregatorforTUSD.latestAnswer();
                            let borrow = new BN(1);
                            let accWBTCBefore = await erc20WBTC.balanceOf(user2);
                            const result = await tokenRegistry.getTokenInfoFromAddress(addressTUSD);
                            const tusdTokenIndex = result[0];
                            await accountsContract.methods["setCollateral(uint8,bool)"](
                                tusdTokenIndex,
                                true,
                                {
                                    from: user2,
                                }
                            );
                            await savingAccount.borrow(addressWBTC, borrow, { from: user2 });

                            const savingsCompoundWBTCAfterBorrow = new BN(
                                await cWBTC.balanceOfUnderlying.call(savingAccount.address)
                            );

                            let accWBTCAfter = await erc20WBTC.balanceOf(user2);
                            expect(BN(accWBTCAfter).sub(BN(accWBTCBefore))).to.be.bignumber.equals(
                                borrow
                            );

                            expect(
                                savingsCompoundWBTCAfterDeposit.sub(
                                    savingsCompoundWBTCBeforeDeposit
                                )
                            ).to.be.bignumber.equals(
                                eightPrecision.mul(new BN(1)).mul(new BN(85)).div(new BN(100))
                            );

                            expect(
                                savingsCompoundWBTCAfterBorrow.sub(savingsCompoundWBTCAfterDeposit)
                            ).to.be.bignumber.equals(new BN(0));
                        });
                        it("Deposits WBTC, borrows the same amount of borrowing power ", async function () {
                            this.timeout(0);
                            /*
                             * Step 1. Assign tokens to each user and deposit them to DeFiner
                             * Account1: deposits 1 WBTC
                             * Account2: deposits 100 TUSD
                             */
                            await erc20WBTC.transfer(user1, eightPrecision.mul(new BN(1)));
                            await erc20TUSD.transfer(user2, eighteenPrecision.mul(new BN(10000)));

                            await erc20WBTC.approve(
                                savingAccount.address,
                                eightPrecision.mul(new BN(1)),
                                { from: user1 }
                            );
                            await erc20TUSD.approve(
                                savingAccount.address,
                                eighteenPrecision.mul(new BN(10000)),
                                { from: user2 }
                            );

                            const savingsCompoundWBTCBeforeDeposit = new BN(
                                await cWBTC.balanceOfUnderlying.call(savingAccount.address)
                            );

                            await savingAccount.deposit(
                                addressWBTC,
                                eightPrecision.mul(new BN(1)),
                                { from: user1 }
                            );
                            await savingAccount.deposit(
                                addressTUSD,
                                eighteenPrecision.mul(new BN(10000)),
                                { from: user2 }
                            );

                            const savingsCompoundWBTCAfterDeposit = new BN(
                                await cWBTC.balanceOfUnderlying.call(savingAccount.address)
                            );

                            /*
                             * Step 2. Assign tokens to each user and deposit them to DeFiner
                             * Account1: Borrows the same as the borrowing power
                             * To verify:
                             * 1. Account1 increases the same amount of borrow power of TUSD
                             */
                            let WBTCPrice = await mockChainlinkAggregatorforWBTC.latestAnswer();
                            let TUSDPrice = await mockChainlinkAggregatorforTUSD.latestAnswer();

                            let borrow = eighteenPrecision
                                .mul(TUSDPrice)
                                .div(WBTCPrice)
                                .div(new BN(100))
                                .mul(new BN(60));
                            let accTUSDBefore = await erc20TUSD.balanceOf(user1);

                            const result = await tokenRegistry.getTokenInfoFromAddress(addressWBTC);
                            const wbtcTokenIndex = result[0];
                            await accountsContract.methods["setCollateral(uint8,bool)"](
                                wbtcTokenIndex,
                                true,
                                {
                                    from: user1,
                                }
                            );
                            await savingAccount.borrow(addressTUSD, borrow, { from: user1 });
                            const savingsCompoundWBTCAfterBorrow = new BN(
                                await cWBTC.balanceOfUnderlying.call(savingAccount.address)
                            );

                            let accTUSDAfter = await erc20TUSD.balanceOf(user1);

                            expect(BN(accTUSDAfter).sub(accTUSDBefore)).to.be.bignumber.equals(
                                borrow
                            );

                            expect(
                                savingsCompoundWBTCAfterDeposit.sub(
                                    savingsCompoundWBTCBeforeDeposit
                                )
                            ).to.be.bignumber.equals(
                                eightPrecision.mul(new BN(1)).mul(new BN(85)).div(new BN(100))
                            );

                            expect(
                                savingsCompoundWBTCAfterBorrow.sub(savingsCompoundWBTCAfterDeposit)
                            ).to.be.bignumber.equals(new BN(0));
                        });
                        it("Deposits TUSD, borrows the same amount of borrowing power", async function () {
                            this.timeout(0);
                            /*
                             * Step 1. Assign tokens to each user and deposit them to DeFiner
                             * Account1: deposits 100 WBTC
                             * Account2: deposits 1 TUSD
                             */
                            await erc20WBTC.transfer(user1, eightPrecision.mul(new BN(100)));
                            await erc20TUSD.transfer(user2, eighteenPrecision.mul(new BN(1)));

                            await erc20WBTC.approve(
                                savingAccount.address,
                                eightPrecision.mul(new BN(100)),
                                { from: user1 }
                            );

                            await erc20TUSD.approve(
                                savingAccount.address,
                                eighteenPrecision.mul(new BN(1)),
                                { from: user2 }
                            );

                            const savingsCompoundWBTCBeforeDeposit = new BN(
                                await cWBTC.balanceOfUnderlying.call(savingAccount.address)
                            );

                            await savingAccount.deposit(
                                addressWBTC,
                                eightPrecision.mul(new BN(100)),
                                { from: user1 }
                            );

                            await savingAccount.deposit(
                                addressTUSD,
                                eighteenPrecision.mul(new BN(1)),
                                { from: user2 }
                            );

                            const savingsCompoundWBTCAfterDeposit = new BN(
                                await cWBTC.balanceOfUnderlying.call(savingAccount.address)
                            );

                            /*
                             * Step 2. Assign tokens to each user and deposit them to DeFiner
                             * Account2:Borrows the same as the borrowing power
                             * To verify:
                             * 1. Account1 increases the same amount of borrow power of TUSD
                             * 2. After deposit, 85% WBTC from savings goes to Compound
                             * 3. After borrowing, the amount of WBTC that savings deposits to Compound doesn't change
                             */
                            let WBTCPrice = await mockChainlinkAggregatorforWBTC.latestAnswer();
                            let TUSDPrice = await mockChainlinkAggregatorforTUSD.latestAnswer();

                            let borrow = eightPrecision
                                .mul(TUSDPrice)
                                .div(WBTCPrice)
                                .div(new BN(100))
                                .mul(new BN(60));

                            let user1WBTCBefore = await erc20WBTC.balanceOf(user2);

                            const result = await tokenRegistry.getTokenInfoFromAddress(addressTUSD);
                            const tusdTokenIndex = result[0];
                            await accountsContract.methods["setCollateral(uint8,bool)"](
                                tusdTokenIndex,
                                true,
                                {
                                    from: user2,
                                }
                            );
                            await savingAccount.borrow(addressWBTC, borrow, { from: user2 });

                            const savingsCompoundWBTCAfterBorrow = new BN(
                                await cWBTC.balanceOfUnderlying.call(savingAccount.address)
                            );

                            let user1WBTCAfter = await erc20WBTC.balanceOf(user2);

                            expect(
                                BN(user1WBTCAfter).sub(BN(user1WBTCBefore))
                            ).to.be.bignumber.equals(borrow);

                            expect(
                                savingsCompoundWBTCAfterDeposit.sub(
                                    savingsCompoundWBTCBeforeDeposit
                                )
                            ).to.be.bignumber.equals(
                                eightPrecision.mul(new BN(100)).mul(new BN(85)).div(new BN(100))
                            );

                            expect(
                                savingsCompoundWBTCAfterBorrow.sub(savingsCompoundWBTCAfterDeposit)
                            ).to.be.bignumber.equals(new BN(0));
                        });

                        it("Deposit USDT, borrow ETH, check if user is liquidatable, deposit FIN-LP", async function () {
                            this.timeout(0);
                            // get initial oracle prices
                            const ethPriceInit = await mockChainlinkAggregatorforETH.latestAnswer();
                            const daiPriceInit = await mockChainlinkAggregatorforDAI.latestAnswer();
                            const usdtPriceInit =
                                await mockChainlinkAggregatorforUSDT.latestAnswer();

                            const ZERO = new BN(0);
                            const ONE_USD = new BN(1);
                            const ONE_ETH = eighteenPrecision;
                            const ONE_USDT = sixPrecision;
                            const ONE_FIN_LP = eighteenPrecision;

                            // set oracle prices
                            const ETH_USD_RATE = new BN(2000);
                            let ONE_USD_IN_ETH = ONE_ETH.div(ETH_USD_RATE);
                            await mockChainlinkAggregatorforETH.updateAnswer(ONE_ETH); // remain constant
                            await mockChainlinkAggregatorforDAI.updateAnswer(ONE_USD_IN_ETH);
                            await mockChainlinkAggregatorforUSDT.updateAnswer(ONE_USD_IN_ETH);
                            // assuming that the FIN_LP price is 1 USD
                            await mockChainlinkAggregatorforFIN_LP.updateAnswer(ONE_USD_IN_ETH);

                            // get oracle prices
                            const ethPrice = await mockChainlinkAggregatorforETH.latestAnswer();
                            const daiPrice = await mockChainlinkAggregatorforDAI.latestAnswer();
                            const usdtPrice = await mockChainlinkAggregatorforUSDT.latestAnswer();

                            const ethPriceInUSD = ethPrice.mul(ETH_USD_RATE).div(ONE_ETH);
                            console.log("ETH price in USD", ethPriceInUSD.toString());
                            expect(ethPriceInUSD).to.be.bignumber.equal(ETH_USD_RATE);
                            const daiPriceInUSD = daiPrice.mul(ETH_USD_RATE).div(ONE_ETH);
                            console.log("DAI price in USD", daiPriceInUSD.toString());
                            expect(daiPriceInUSD).to.be.bignumber.equal(ONE_USD);
                            const usdtPriceInUSD = usdtPrice.mul(ETH_USD_RATE).div(ONE_ETH);
                            console.log("USDT price in USD", usdtPriceInUSD.toString());
                            expect(usdtPriceInUSD).to.be.bignumber.equal(ONE_USD);

                            // owner - deposit 100 ETH
                            await savingAccount.deposit(ETH_ADDRESS, ONE_ETH.mul(new BN(100)), {
                                from: owner,
                                value: ONE_ETH.mul(new BN(100)),
                            });

                            // 1. Transfer tokens to user1
                            await erc20USDT.transfer(user1, ONE_USDT.mul(new BN(200)));
                            await erc20DAI.transfer(user1, ONE_DAI.mul(new BN(200)));
                            await erc20LP.transfer(user1, ONE_FIN_LP.mul(new BN(200)));

                            await erc20USDT.approve(
                                savingAccount.address,
                                ONE_USDT.mul(new BN(200)),
                                { from: user1 }
                            );
                            await erc20DAI.approve(
                                savingAccount.address,
                                ONE_DAI.mul(new BN(200)),
                                { from: user1 }
                            );
                            await erc20LP.approve(
                                savingAccount.address,
                                ONE_FIN_LP.mul(new BN(200)),
                                { from: user1 }
                            );

                            // Set BorrowLTV of FIN-LP token to 0
                            await testEngine.tokenInfoRegistry.updateBorrowLTV(addressLP, ZERO);

                            // ensure that borrowLTV is 0
                            const finlpBorrowLTV = await testEngine.tokenInfoRegistry.getBorrowLTV(
                                addressLP
                            );
                            expect(finlpBorrowLTV).to.be.bignumber.equal(ZERO);

                            // 2. User1 deposits 100 USDT
                            const collateralAmount = ONE_USDT.mul(new BN(100));
                            await savingAccount.deposit(addressUSDT, collateralAmount, {
                                from: user1,
                            });

                            // enable USDT as collateral
                            const result = await tokenRegistry.getTokenInfoFromAddress(addressUSDT);
                            const indexUSDT = result[0];
                            await accountsContract.methods["setCollateral(uint8,bool)"](
                                indexUSDT,
                                true,
                                { from: user1 }
                            );

                            // print status before borrow
                            let user1BorrowPower = await accountsContract.getBorrowPower(user1);
                            let borrowPowerInUSD = user1BorrowPower.mul(ETH_USD_RATE).div(ONE_ETH);
                            console.log("user1BorrowPower in ETH", user1BorrowPower.toString());
                            console.log("user1BorrowPower in USD", borrowPowerInUSD.toString());
                            expect(borrowPowerInUSD).to.be.bignumber.equal(new BN(60)); // $60
                            let currentBorrowedETH = await accountsContract.getBorrowETH(user1);
                            let currentBorrowedUSD = currentBorrowedETH
                                .mul(ETH_USD_RATE)
                                .div(ONE_ETH);
                            console.log("current borrowed in USD:", currentBorrowedUSD.toString());
                            expect(currentBorrowedUSD).to.be.bignumber.equal(ZERO);
                            let availForBorrowInUSD = borrowPowerInUSD.sub(currentBorrowedUSD);
                            console.log(
                                "available for borrow in USD:",
                                availForBorrowInUSD.toString()
                            );
                            expect(availForBorrowInUSD).to.be.bignumber.equal(new BN(60)); // $60

                            // =========
                            // 3. user 1 borrows ETH with all borrowPower
                            await savingAccount.borrow(ETH_ADDRESS, user1BorrowPower, {
                                from: user1,
                            });
                            console.log("USER BORROWED FULL BORROW POWER");
                            // =========

                            // print status after borrow
                            user1BorrowPower = await accountsContract.getBorrowPower(user1);
                            borrowPowerInUSD = user1BorrowPower.mul(ETH_USD_RATE).div(ONE_ETH);
                            console.log("user1BorrowPower in ETH", user1BorrowPower.toString());
                            console.log("user1BorrowPower in USD", borrowPowerInUSD.toString());
                            expect(borrowPowerInUSD).to.be.bignumber.equal(new BN(60)); // $60
                            currentBorrowedETH = await accountsContract.getBorrowETH(user1);
                            currentBorrowedUSD = currentBorrowedETH.mul(ETH_USD_RATE).div(ONE_ETH);
                            console.log("current borrowed in USD:", currentBorrowedUSD.toString());
                            expect(currentBorrowedUSD).to.be.bignumber.equal(new BN(60)); // $60
                            availForBorrowInUSD = borrowPowerInUSD.sub(currentBorrowedUSD);
                            console.log(
                                "available for borrow in USD:",
                                availForBorrowInUSD.toString()
                            );
                            expect(availForBorrowInUSD).to.be.bignumber.equal(ZERO); // $0

                            let collAmtInETH = await accountsContract.getDepositETH(user1);
                            let collateralAmtInUSD = collAmtInETH.mul(ETH_USD_RATE).div(ONE_ETH);
                            console.log(
                                "user collateral amount in USD:",
                                collateralAmtInUSD.toString()
                            );
                            expect(collateralAmtInUSD).to.be.bignumber.equal(new BN(100)); // $100
                            const borrowedAmtInETH = await accountsContract.getBorrowETH(user1);
                            const borrowedAmtInUSD = borrowedAmtInETH
                                .mul(ETH_USD_RATE)
                                .div(ONE_ETH);
                            console.log("borrowedAmtInETH", borrowedAmtInETH.toString());
                            console.log(
                                "user borrowed amount in USD:",
                                borrowedAmtInUSD.toString()
                            );
                            expect(borrowedAmtInUSD).to.be.bignumber.equal(new BN(60)); // $60

                            let collateralRatio = borrowedAmtInUSD
                                .mul(new BN(100))
                                .div(collateralAmtInUSD);
                            console.log("collateral ratio in % :", collateralRatio.toString());
                            expect(collateralRatio).to.be.bignumber.equal(new BN(60)); // 60%

                            // TODO further
                            // 4. increase ETH price
                            const newETH_USD_RATE = new BN(3000);
                            ONE_USD_IN_ETH = ONE_ETH.div(newETH_USD_RATE);
                            //await mockChainlinkAggregatorforETH.updateAnswer(ONE_ETH); // remain constant
                            await mockChainlinkAggregatorforDAI.updateAnswer(ONE_USD_IN_ETH);
                            await mockChainlinkAggregatorforUSDT.updateAnswer(ONE_USD_IN_ETH);
                            await mockChainlinkAggregatorforFIN_LP.updateAnswer(ONE_USD_IN_ETH);

                            console.log("PRICE UPDATED");

                            // get oracle prices
                            const UPD_ethPrice = await mockChainlinkAggregatorforETH.latestAnswer();
                            const UPD_daiPrice = await mockChainlinkAggregatorforDAI.latestAnswer();
                            const UPD_usdtPrice =
                                await mockChainlinkAggregatorforUSDT.latestAnswer();
                            console.log("ETH price in ETH", UPD_ethPrice.toString());
                            console.log("DAI price in ETH", UPD_daiPrice.toString());
                            console.log("USDT price in ETH", UPD_usdtPrice.toString());

                            const borrowedAmtInETH2 = await accountsContract.getBorrowETH(user1);
                            console.log("borrowedAmtInETH2", borrowedAmtInETH2.toString());
                            const borrowedAmtInUSD2 = borrowedAmtInETH2
                                .mul(newETH_USD_RATE)
                                .div(ONE_ETH);
                            console.log(
                                "user borrowed amount in USD:",
                                borrowedAmtInUSD2.toString()
                            );
                            // ETH price increased from $2000 to $3000 (which is 1.5 times)
                            // so user borrowed $60 earlier, after price increase
                            // $60 * 1.5 = $90
                            expect(borrowedAmtInUSD2).to.be.bignumber.equal(new BN(90)); // $90
                            collAmtInETH = await accountsContract.getDepositETH(user1);
                            collateralAmtInUSD = collAmtInETH.mul(newETH_USD_RATE).div(ONE_ETH);
                            console.log(
                                "user collateral amount in USD:",
                                collateralAmtInUSD.toString()
                            );
                            // rounding error $100 ~= $99
                            expect(collateralAmtInUSD).to.be.bignumber.equal(new BN(99));
                            collateralRatio = borrowedAmtInUSD2
                                .mul(new BN(100))
                                .div(collateralAmtInUSD);
                            console.log("collateral ratio in % :", collateralRatio.toString());
                            expect(collateralRatio).to.be.bignumber.equal(new BN(90)); // 90%

                            let isAccountLiquidatable =
                                await accountsContract.isAccountLiquidatable.call(user1);
                            console.log("isAccountLiquidatable", isAccountLiquidatable);
                            expect(isAccountLiquidatable).to.be.equal(true);

                            // 4. user1 deposits 100 LPTokens
                            await savingAccount.deposit(addressLP, ONE_FIN_LP.mul(new BN(100)), {
                                from: user1,
                            });

                            isAccountLiquidatable =
                                await accountsContract.isAccountLiquidatable.call(user1);
                            console.log("isAccountLiquidatable", isAccountLiquidatable);
                            expect(isAccountLiquidatable).to.be.equal(true);

                            // revert back to original prices
                            await mockChainlinkAggregatorforETH.updateAnswer(ethPriceInit);
                            await mockChainlinkAggregatorforDAI.updateAnswer(daiPriceInit);
                            await mockChainlinkAggregatorforUSDT.updateAnswer(usdtPriceInit);
                        });
                    });
                }
            );
        });

        context("Call multiple times", async () => {
            context("Should succeed", async () => {
                it("Uses 18 decimals, TUSD", async function () {
                    this.timeout(0);
                    /*
                     * Step 1
                     * Account 1: Deposits 100 whole DAI tokens
                     * Account 2: Depoists 100 whole TUSD tokens
                     */
                    await erc20DAI.transfer(user1, eighteenPrecision.mul(new BN(100)));
                    await erc20TUSD.transfer(user2, eighteenPrecision.mul(new BN(100)));

                    await erc20DAI.approve(
                        savingAccount.address,
                        eighteenPrecision.mul(new BN(100)),
                        { from: user1 }
                    );
                    await erc20TUSD.approve(
                        savingAccount.address,
                        eighteenPrecision.mul(new BN(100)),
                        { from: user2 }
                    );

                    const savingsCompoundDAIBeforeDeposit = new BN(
                        await cDAI.balanceOfUnderlying.call(savingAccount.address)
                    );

                    const savingsDAIBeforeDeposit = new BN(
                        await erc20DAI.balanceOf(savingAccount.address)
                    );

                    await savingAccount.deposit(addressDAI, eighteenPrecision.mul(new BN(100)), {
                        from: user1,
                    });
                    await savingAccount.deposit(addressTUSD, eighteenPrecision.mul(new BN(100)), {
                        from: user2,
                    });

                    await savAccBalVerify(
                        0,
                        eighteenPrecision.mul(new BN(100)),
                        erc20DAI.address,
                        cDAI,
                        savingsCompoundDAIBeforeDeposit,
                        savingsDAIBeforeDeposit,
                        bank,
                        savingAccount
                    );
                    /*
                     * Step 2
                     * Account 1: Borrows 10 whole TUSD twice
                     * To verify:
                     * 1. Account 1's TUSD balance should be 10 after the first borrow
                     * 2. Account 1's TUSD balance should be 20 after the second borrow
                     */
                    let borrow = eighteenPrecision.mul(new BN(10));
                    let accTUSDBeforeFirst = await erc20TUSD.balanceOf(user1);

                    const result = await tokenRegistry.getTokenInfoFromAddress(addressDAI);
                    const daiTokenIndex = result[0];
                    await accountsContract.methods["setCollateral(uint8,bool)"](
                        daiTokenIndex,
                        true,
                        {
                            from: user1,
                        }
                    );
                    await savingAccount.borrow(addressTUSD, borrow, { from: user1 });

                    let accTUSDAfterFirst = await erc20TUSD.balanceOf(user1);

                    await savingAccount.borrow(addressTUSD, borrow, { from: user1 });

                    let accTUSDAfterSecond = await erc20TUSD.balanceOf(user1);

                    // Verify 1.
                    expect(
                        BN(accTUSDAfterFirst).sub(BN(accTUSDBeforeFirst))
                    ).to.be.bignumber.equals(borrow);

                    // Verify 2.
                    expect(
                        BN(accTUSDAfterSecond).sub(BN(accTUSDBeforeFirst))
                    ).to.be.bignumber.equals(borrow.mul(new BN(2)));
                });

                it("Uses 6 decimals, USDC", async function () {
                    this.timeout(0);
                    /*
                     * Step 1
                     * Account 1: Deposits 100 whole DAI tokens
                     * Account 2: Depoists 100 whole USDC tokens
                     */
                    await erc20DAI.transfer(user1, eighteenPrecision.mul(new BN(100)));
                    await erc20USDC.transfer(user2, sixPrecision.mul(new BN(100)));

                    await erc20DAI.approve(
                        savingAccount.address,
                        eighteenPrecision.mul(new BN(100)),
                        { from: user1 }
                    );
                    await erc20USDC.approve(savingAccount.address, sixPrecision.mul(new BN(100)), {
                        from: user2,
                    });

                    const savingsCompoundDAIBeforeDeposit = new BN(
                        await cDAI.balanceOfUnderlying.call(savingAccount.address)
                    );

                    const savingsDAIBeforeDeposit = new BN(
                        await erc20DAI.balanceOf(savingAccount.address)
                    );

                    const savingsCompoundUSDCBeforeDeposit = new BN(
                        await cUSDC.balanceOfUnderlying.call(savingAccount.address)
                    );

                    const savingsUSDCBeforeDeposit = new BN(
                        await erc20USDC.balanceOf(savingAccount.address)
                    );

                    await savingAccount.deposit(addressDAI, eighteenPrecision.mul(new BN(100)), {
                        from: user1,
                    });
                    await savingAccount.deposit(addressUSDC, sixPrecision.mul(new BN(100)), {
                        from: user2,
                    });

                    await savAccBalVerify(
                        0,
                        eighteenPrecision.mul(new BN(100)),
                        erc20DAI.address,
                        cDAI,
                        savingsCompoundDAIBeforeDeposit,
                        savingsDAIBeforeDeposit,
                        bank,
                        savingAccount
                    );

                    await savAccBalVerify(
                        0,
                        sixPrecision.mul(new BN(100)),
                        erc20USDC.address,
                        cUSDC,
                        savingsCompoundUSDCBeforeDeposit,
                        savingsUSDCBeforeDeposit,
                        bank,
                        savingAccount
                    );

                    const savingsCompoundUSDCAfterDeposit = new BN(
                        await cUSDC.balanceOfUnderlying.call(savingAccount.address)
                    );

                    const savingsUSDCAfterDeposit = new BN(
                        await erc20USDC.balanceOf(savingAccount.address)
                    );

                    /*
                     * Step 2
                     * Account 1: Borrows 10 whole USDC twice
                     * To verify:
                     * 1. Account 1's USDC balance should be 10 after the first borrow
                     * 2. Account 1's USDC balance should be 20 after the second borrow
                     */
                    let borrow = sixPrecision.mul(new BN(10));
                    let accUSDCBeforeFirst = await erc20USDC.balanceOf(user1);

                    const result = await tokenRegistry.getTokenInfoFromAddress(addressDAI);
                    const daiTokenIndex = result[0];
                    await accountsContract.methods["setCollateral(uint8,bool)"](
                        daiTokenIndex,
                        true,
                        {
                            from: user1,
                        }
                    );
                    await savingAccount.borrow(addressUSDC, borrow, { from: user1 });

                    await savAccBalVerify(
                        2,
                        borrow,
                        erc20USDC.address,
                        cUSDC,
                        savingsCompoundUSDCAfterDeposit,
                        savingsUSDCAfterDeposit,
                        bank,
                        savingAccount
                    );

                    const savingsCompoundUSDCAfterFirstBorrow = new BN(
                        await cUSDC.balanceOfUnderlying.call(savingAccount.address)
                    );

                    const savingsUSDCAfterFirstBorrow = new BN(
                        await erc20USDC.balanceOf(savingAccount.address)
                    );

                    let accUSDCAfterFirst = await erc20USDC.balanceOf(user1);

                    await savingAccount.borrow(addressUSDC, borrow, { from: user1 });

                    let accUSDCAfterSecond = await erc20USDC.balanceOf(user1);

                    await savAccBalVerify(
                        2,
                        borrow,
                        erc20USDC.address,
                        cUSDC,
                        savingsCompoundUSDCAfterFirstBorrow,
                        savingsUSDCAfterFirstBorrow,
                        bank,
                        savingAccount
                    );

                    // Verify 1.
                    expect(
                        BN(accUSDCAfterFirst).sub(BN(accUSDCBeforeFirst))
                    ).to.be.bignumber.equals(borrow);

                    // Verify 2.
                    expect(
                        BN(accUSDCAfterSecond).sub(BN(accUSDCBeforeFirst))
                    ).to.be.bignumber.equals(borrow.mul(new BN(2)));
                });

                it("Uses 8 decimals, WBTC", async function () {
                    this.timeout(0);
                    /*
                     * Step 1
                     * Account 1: Deposits 1000 whole DAI tokens
                     * Account 2: Depoists 1000 whole WBTC tokens
                     */
                    await erc20DAI.transfer(user1, eighteenPrecision.mul(new BN(1000)));
                    await erc20WBTC.transfer(user2, eightPrecision.mul(new BN(1000)));

                    await erc20DAI.approve(
                        savingAccount.address,
                        eighteenPrecision.mul(new BN(1000)),
                        { from: user1 }
                    );
                    await erc20WBTC.approve(
                        savingAccount.address,
                        eightPrecision.mul(new BN(1000)),
                        { from: user2 }
                    );

                    const savingsCompoundDAIBeforeDeposit = new BN(
                        await cDAI.balanceOfUnderlying.call(savingAccount.address)
                    );

                    const savingsDAIBeforeDeposit = new BN(
                        await erc20DAI.balanceOf(savingAccount.address)
                    );

                    const savingsCompoundWBTCBeforeDeposit = new BN(
                        await cWBTC.balanceOfUnderlying.call(savingAccount.address)
                    );

                    const savingsWBTCBeforeDeposit = new BN(
                        await erc20WBTC.balanceOf(savingAccount.address)
                    );

                    await savingAccount.deposit(addressDAI, eighteenPrecision.mul(new BN(1000)), {
                        from: user1,
                    });
                    await savingAccount.deposit(addressWBTC, eightPrecision.mul(new BN(1000)), {
                        from: user2,
                    });

                    await savAccBalVerify(
                        0,
                        eighteenPrecision.mul(new BN(1000)),
                        erc20DAI.address,
                        cDAI,
                        savingsCompoundDAIBeforeDeposit,
                        savingsDAIBeforeDeposit,
                        bank,
                        savingAccount
                    );

                    await savAccBalVerify(
                        0,
                        eightPrecision.mul(new BN(1000)),
                        erc20WBTC.address,
                        cWBTC,
                        savingsCompoundWBTCBeforeDeposit,
                        savingsWBTCBeforeDeposit,
                        bank,
                        savingAccount
                    );

                    const savingsCompoundWBTCAfterDeposit = new BN(
                        await cWBTC.balanceOfUnderlying.call(savingAccount.address)
                    );

                    const savingsWBTCAfterDeposit = new BN(
                        await erc20WBTC.balanceOf(savingAccount.address)
                    );

                    /*
                     * Step 2
                     * Account 1: Borrows 0.01 whole WBTC twice
                     * To verify:
                     * 1. Account 1's WBTC balance should be 10 after the first borrow
                     * 2. Account 1's WBTC balance should be 20 after the second borrow
                     */
                    let borrow = eightPrecision.div(new BN(100));
                    let accWBTCAfterFirstBefore = await erc20WBTC.balanceOf(user1);

                    const result = await tokenRegistry.getTokenInfoFromAddress(addressDAI);
                    const daiTokenIndex = result[0];
                    await accountsContract.methods["setCollateral(uint8,bool)"](
                        daiTokenIndex,
                        true,
                        {
                            from: user1,
                        }
                    );
                    await savingAccount.borrow(addressWBTC, borrow, { from: user1 });

                    await savAccBalVerify(
                        2,
                        borrow,
                        erc20WBTC.address,
                        cWBTC,
                        savingsCompoundWBTCAfterDeposit,
                        savingsWBTCAfterDeposit,
                        bank,
                        savingAccount
                    );

                    const savingsCompoundWBTCAfterFirstBorrow = new BN(
                        await cWBTC.balanceOfUnderlying.call(savingAccount.address)
                    );

                    const savingsWBTCAfterFirstBorrow = new BN(
                        await erc20WBTC.balanceOf(savingAccount.address)
                    );

                    let accWBTCAfterFirst = await erc20WBTC.balanceOf(user1);
                    await savingAccount.borrow(addressWBTC, borrow, { from: user1 });

                    const savingsCompoundDAIAfterSecondBorrow = new BN(
                        await cDAI.balanceOfUnderlying.call(savingAccount.address)
                    );
                    const savingsCompoundWBTCAfterSecondBorrow = new BN(
                        await cWBTC.balanceOfUnderlying.call(savingAccount.address)
                    );

                    let accWBTCAfterSecond = await erc20WBTC.balanceOf(user1);

                    await savAccBalVerify(
                        2,
                        borrow,
                        erc20WBTC.address,
                        cWBTC,
                        savingsCompoundWBTCAfterFirstBorrow,
                        savingsWBTCAfterFirstBorrow,
                        bank,
                        savingAccount
                    );

                    // Verify 1.
                    expect(
                        BN(accWBTCAfterFirst).sub(BN(accWBTCAfterFirstBefore))
                    ).to.be.bignumber.equals(borrow);
                    // Verify 2.
                    expect(
                        BN(accWBTCAfterSecond).sub(BN(accWBTCAfterFirstBefore))
                    ).to.be.bignumber.equals(borrow.mul(new BN(2)));
                });
            });
        });
    });
});
