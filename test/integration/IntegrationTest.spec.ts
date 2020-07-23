import * as t from "../../types/truffle-contracts/index";
import { TestEngine } from "../../test-helpers/TestEngine";

var chai = require("chai");
var expect = chai.expect;
var tokenData = require("../../test-helpers/tokenData.json");

const { BN, expectRevert, time } = require("@openzeppelin/test-helpers");

const ERC20: t.ERC20Contract = artifacts.require("ERC20");
const MockCToken: t.MockCTokenContract = artifacts.require("MockCToken");

contract("Integration Tests", async (accounts) => {
    const ETH_ADDRESS: string = "0x000000000000000000000000000000000000000E";
    let testEngine: TestEngine;
    let savingAccount: t.SavingAccountInstance;

    const owner = accounts[0];
    const user1 = accounts[1];
    const user2 = accounts[2];
    const user3 = accounts[3];
    const dummy = accounts[9];
    const eighteenPrecision = new BN(10).pow(new BN(18));
    const sixPrecision = new BN(10).pow(new BN(6));

    let tokens: any;
    let addressDAI: any;
    let addressUSDC: any;
    let addressUSDT: any;
    let addressTUSD: any;
    let addressMKR: any;
    let addressBAT: any;
    let addressZRX: any;
    let addressREP: any;
    let addressWBTC: any;
    let addressCTokenForDAI: any;
    let addressCTokenForUSDC: any;
    let addressCTokenForUSDT: any;
    let addressCTokenForWBTC: any;
    let cTokenDAI: t.MockCTokenInstance;
    let cTokenUSDC: t.MockCTokenInstance;
    let cTokenUSDT: t.MockCTokenInstance;
    let cTokenWBTC: t.MockCTokenInstance;
    let erc20DAI: t.ERC20Instance;
    let erc20USDC: t.ERC20Instance;
    let erc20USDT: t.ERC20Instance;
    let erc20TUSD: t.ERC20Instance;
    let erc20MKR: t.ERC20Instance;
    let erc20BAT: t.ERC20Instance;
    let erc20ZRX: t.ERC20Instance;
    let erc20REP: t.ERC20Instance;
    let erc20WBTC: t.ERC20Instance;
    let ZERO: any;
    let ONE_WEEK: any;
    let ONE_MONTH: any;
    let tempContractAddress: any;
    let cTokenTemp: t.MockCTokenInstance;
    let addressCTokenTemp: any;
    let erc20contr: t.ERC20Instance;

    before(async () => {
        // Things to initialize before all test
        testEngine = new TestEngine();
        testEngine.deploy("scriptFlywheel.scen");
    });

    beforeEach(async () => {
        savingAccount = await testEngine.deploySavingAccount();
        // 1. initialization.
        tokens = await testEngine.erc20Tokens;
        addressDAI = tokens[0];
        addressUSDC = tokens[1];
        addressUSDT = tokens[2];
        addressTUSD = tokens[3];
        addressMKR = tokens[4];
        addressBAT = tokens[5];
        addressZRX = tokens[6];
        addressREP = tokens[7];
        addressWBTC = tokens[8];
        erc20DAI = await ERC20.at(addressDAI);
        erc20USDC = await ERC20.at(addressUSDC);
        erc20USDT = await ERC20.at(addressUSDT);
        erc20TUSD = await ERC20.at(addressTUSD);
        erc20MKR = await ERC20.at(addressMKR);
        erc20BAT = await ERC20.at(addressBAT);
        erc20ZRX = await ERC20.at(addressZRX);
        erc20REP = await ERC20.at(addressREP);
        erc20WBTC = await ERC20.at(addressWBTC);
        ZERO = new BN(0);
        ONE_WEEK = new BN(7).mul(new BN(24).mul(new BN(3600)));
        ONE_MONTH = new BN(30).mul(new BN(24).mul(new BN(3600)));
        /* addressCTokenForDAI = await testEngine.tokenInfoRegistry.getCToken(addressDAI);
        addressCTokenForUSDC = await testEngine.tokenInfoRegistry.getCToken(addressUSDC);
        addressCTokenForUSDT = await testEngine.tokenInfoRegistry.getCToken(addressUSDT);
        addressCTokenForWBTC = await testEngine.tokenInfoRegistry.getCToken(addressWBTC);
        cTokenDAI = await MockCToken.at(addressCTokenForDAI);
        cTokenUSDC = await MockCToken.at(addressCTokenForUSDC);
        cTokenUSDT = await MockCToken.at(addressCTokenForUSDT);
        cTokenWBTC = await MockCToken.at(addressCTokenForWBTC); */
    });

    context("Deposit and Withdraw", async () => {
        context("should succeed", async () => {
            it("should deposit all tokens and withdraw all tokens", async () => {
                //TODO: Deposit & withdraw w/ multiple users once deposit bug is fixed
                // Error: multiplication overflow
                const numOfToken = new BN(1000);

                for (let i = 0; i < 9; i++) {
                    tempContractAddress = tokens[i];
                    erc20contr = await ERC20.at(tempContractAddress);
                    addressCTokenTemp = await testEngine.tokenInfoRegistry.getCToken(
                        tempContractAddress
                    );
                    cTokenTemp = await MockCToken.at(addressCTokenTemp);

                    await erc20contr.transfer(user1, numOfToken);
                    await erc20contr.approve(savingAccount.address, numOfToken, {
                        from: user1
                    });

                    const balSavingAccountBeforeDeposit = await erc20contr.balanceOf(
                        savingAccount.address
                    );
                    const totalDefinerBalanceBeforeDeposit = await savingAccount.tokenBalance(
                        erc20contr.address,
                        {
                            from: user1
                        }
                    );
                    const balCTokenContractInit = await erc20contr.balanceOf(addressCTokenTemp);

                    //await erc20contr.approve(savingAccount.address, numOfToken);
                    await savingAccount.deposit(erc20contr.address, numOfToken, {
                        from: user1
                    });

                    const balSavingAccountAfterDeposit = await erc20contr.balanceOf(
                        savingAccount.address
                    );

                    // Validate the total balance on DeFiner after deposit
                    const totalDefinerBalanceAfterDeposit = await savingAccount.tokenBalance(
                        erc20contr.address,
                        {
                            from: user1
                        }
                    );

                    const totalDefinerBalanceChange = new BN(
                        totalDefinerBalanceAfterDeposit[0]
                    ).sub(new BN(totalDefinerBalanceBeforeDeposit[0]));
                    expect(totalDefinerBalanceChange).to.be.bignumber.equal(numOfToken);

                    //Verify if deposit was successful
                    const expectedTokensAtSavingAccountContract = numOfToken
                        .mul(new BN(15))
                        .div(new BN(100));
                    const balSavingAccount = await erc20contr.balanceOf(savingAccount.address);
                    expect(expectedTokensAtSavingAccountContract).to.be.bignumber.equal(
                        balSavingAccount
                    );

                    // Verify balance on Compound
                    const expectedTokensAtCTokenContract = numOfToken
                        .mul(new BN(85))
                        .div(new BN(100));
                    const balCTokenContract = await erc20contr.balanceOf(addressCTokenTemp);
                    expect(expectedTokensAtCTokenContract).to.be.bignumber.equal(
                        new BN(balCTokenContract).sub(new BN(balCTokenContractInit))
                    );

                    //TODO
                    // Verify balance for cTokens
                    const expectedCTokensAtSavingAccount = numOfToken
                        .mul(new BN(85))
                        .div(new BN(100));
                    const balCTokens = await cTokenTemp.balanceOf(savingAccount.address);
                    //expect(expectedCTokensAtSavingAccount).to.be.bignumber.equal(balCTokens);
                }

                //Withdraw all tokens of each Address
                for (let j = 0; j < 9; j++) {
                    tempContractAddress = tokens[j];
                    erc20contr = await ERC20.at(tempContractAddress);
                    addressCTokenTemp = await testEngine.tokenInfoRegistry.getCToken(
                        tempContractAddress
                    );
                    cTokenTemp = await MockCToken.at(addressCTokenTemp);

                    await savingAccount.withdrawAll(erc20contr.address, {
                        from: user1
                    });

                    //Verify if withdrawAll was successful
                    const balSavingAccount = await erc20contr.balanceOf(savingAccount.address);
                    expect(ZERO).to.be.bignumber.equal(balSavingAccount);

                    // Verify Compound balance
                    const balCToken = await erc20contr.balanceOf(addressCTokenTemp);
                    //expect(ZERO).to.be.bignumber.equal(balCToken);

                    // Verify CToken balance
                    const balCTokens = await cTokenTemp.balanceOf(savingAccount.address);
                    expect(ZERO).to.be.bignumber.equal(balCTokens);

                    // Verify DeFiner balance
                    const totalDefinerBalancAfterWithdraw = await savingAccount.tokenBalance(
                        erc20contr.address,
                        {
                            from: user1
                        }
                    );
                    expect(ZERO).to.be.bignumber.equal(totalDefinerBalancAfterWithdraw[0]);
                }
            });

            it("should deposit all and withdraw only non-Compound tokens (MKR, TUSD)", async () => {
                // failing at BAT -- safeERC20 low level call failed
                const numOfToken = new BN(1000);

                // Deposit all tokens
                for (let i = 0; i < 9; i++) {
                    tempContractAddress = tokens[i];
                    erc20contr = await ERC20.at(tempContractAddress);

                    //await erc20contr.transfer(accounts[userDeposit], numOfToken);
                    await erc20contr.approve(savingAccount.address, numOfToken);
                    //await erc20contr.approve(savingAccount.address, numOfToken);
                    const totalDefinerBalanceBeforeDeposit = await savingAccount.tokenBalance(
                        erc20contr.address
                    );

                    await savingAccount.deposit(erc20contr.address, numOfToken);

                    //Verify if deposit was successful
                    const expectedTokensAtSavingAccountContract = numOfToken
                        .mul(new BN(15))
                        .div(new BN(100));
                    const balSavingAccount = await erc20contr.balanceOf(savingAccount.address);
                    expect(expectedTokensAtSavingAccountContract).to.be.bignumber.equal(
                        balSavingAccount
                    );

                    // Validate the total balance on DeFiner after deposit
                    const totalDefinerBalanceAfterDeposit = await savingAccount.tokenBalance(
                        erc20contr.address
                    );

                    const totalDefinerBalanceChange = new BN(
                        totalDefinerBalanceAfterDeposit[0]
                    ).sub(new BN(totalDefinerBalanceBeforeDeposit[0]));
                    expect(totalDefinerBalanceChange).to.be.bignumber.equal(numOfToken);
                }

                //Withdraw TUSD & MKR
                for (let i = 3; i <= 4; i++) {
                    tempContractAddress = tokens[i];
                    erc20contr = await ERC20.at(tempContractAddress);

                    await savingAccount.withdrawAll(erc20contr.address);

                    //Verify if withdrawAll was successful
                    const balSavingAccount = await erc20contr.balanceOf(savingAccount.address);
                    expect(ZERO).to.be.bignumber.equal(balSavingAccount);

                    // Verify DeFiner balance
                    const totalDefinerBalancAfterWithdraw = await savingAccount.tokenBalance(
                        erc20contr.address
                    );
                    expect(ZERO).to.be.bignumber.equal(totalDefinerBalancAfterWithdraw[0]);
                }
            });

            it("should deposit all and withdraw Compound supported tokens", async () => {
                // failing at BAT -- safeERC20 low level call failed
                const numOfToken = new BN(1000);

                // Deposit all tokens
                for (let i = 0; i < 9; i++) {
                    tempContractAddress = tokens[i];
                    erc20contr = await ERC20.at(tempContractAddress);
                    //await erc20contr.transfer(accounts[userDeposit], numOfToken);
                    await erc20contr.approve(savingAccount.address, numOfToken);
                    //await erc20contr.approve(savingAccount.address, numOfToken);

                    const totalDefinerBalanceBeforeDeposit = await savingAccount.tokenBalance(
                        erc20contr.address
                    );

                    await savingAccount.deposit(erc20contr.address, numOfToken);

                    //Verify if deposit was successful
                    const expectedTokensAtSavingAccountContract = numOfToken
                        .mul(new BN(15))
                        .div(new BN(100));
                    const balSavingAccount = await erc20contr.balanceOf(savingAccount.address);
                    expect(expectedTokensAtSavingAccountContract).to.be.bignumber.equal(
                        balSavingAccount
                    );

                    // Validate the total balance on DeFiner after deposit
                    const totalDefinerBalanceAfterDeposit = await savingAccount.tokenBalance(
                        erc20contr.address
                    );

                    const totalDefinerBalanceChange = new BN(
                        totalDefinerBalanceAfterDeposit[0]
                    ).sub(new BN(totalDefinerBalanceBeforeDeposit[0]));
                    expect(totalDefinerBalanceChange).to.be.bignumber.equal(numOfToken);
                }

                for (let i = 0; i < 9; i++) {
                    if (i != 3 && i != 4) {
                        tempContractAddress = tokens[i];
                        erc20contr = await ERC20.at(tempContractAddress);
                        addressCTokenTemp = await testEngine.tokenInfoRegistry.getCToken(
                            tempContractAddress
                        );
                        cTokenTemp = await MockCToken.at(addressCTokenTemp);
                        // const balSavingCToken = await cTokenTemp.balanceOfUnderlying.call(savingAccount.address);
                        // console.log(balSavingCToken.toString())
                        await savingAccount.withdrawAll(erc20contr.address);

                        //Verify if withdrawAll was successful
                        const balSavingAccount = await erc20contr.balanceOf(savingAccount.address);
                        expect(ZERO).to.be.bignumber.equal(balSavingAccount);

                        // Verify DeFiner balance
                        const totalDefinerBalancAfterWithdraw = await savingAccount.tokenBalance(
                            erc20contr.address
                        );
                        expect(ZERO).to.be.bignumber.equal(totalDefinerBalancAfterWithdraw[0]);
                    }
                }
            });

            it("should deposit all and withdraw only token with less than 18 decimals", async () => {
                const numOfToken = new BN(1000);

                // Deposit all tokens
                for (let i = 0; i < 9; i++) {
                    tempContractAddress = tokens[i];
                    erc20contr = await ERC20.at(tempContractAddress);

                    //await erc20contr.transfer(accounts[userDeposit], numOfToken);
                    await erc20contr.approve(savingAccount.address, numOfToken);
                    //await erc20contr.approve(savingAccount.address, numOfToken);
                    const totalDefinerBalanceBeforeDeposit = await savingAccount.tokenBalance(
                        erc20contr.address
                    );

                    await savingAccount.deposit(erc20contr.address, numOfToken);

                    //Verify if deposit was successful
                    const expectedTokensAtSavingAccountContract = numOfToken
                        .mul(new BN(15))
                        .div(new BN(100));
                    const balSavingAccount = await erc20contr.balanceOf(savingAccount.address);
                    expect(expectedTokensAtSavingAccountContract).to.be.bignumber.equal(
                        balSavingAccount
                    );

                    // Validate the total balance on DeFiner after deposit
                    const totalDefinerBalanceAfterDeposit = await savingAccount.tokenBalance(
                        erc20contr.address
                    );

                    const totalDefinerBalanceChange = new BN(
                        totalDefinerBalanceAfterDeposit[0]
                    ).sub(new BN(totalDefinerBalanceBeforeDeposit[0]));
                    expect(totalDefinerBalanceChange).to.be.bignumber.equal(numOfToken);
                }

                for (let i = 0; i < 9; i++) {
                    if (i == 1 || i == 2 || i == 8) {
                        tempContractAddress = tokens[i];
                        erc20contr = await ERC20.at(tempContractAddress);
                        await savingAccount.withdrawAll(erc20contr.address);

                        //Verify if withdrawAll was successful
                        const balSavingAccount = await erc20contr.balanceOf(savingAccount.address);
                        expect(ZERO).to.be.bignumber.equal(balSavingAccount);

                        // Verify DeFiner balance
                        const totalDefinerBalancAfterWithdraw = await savingAccount.tokenBalance(
                            erc20contr.address
                        );
                        expect(ZERO).to.be.bignumber.equal(totalDefinerBalancAfterWithdraw[0]);
                    }
                }
            });

            it("should deposit 1million of each token, wait for a week, withdraw all", async () => {
                const numOfToken = new BN(10).pow(new BN(6));

                // Deposit all tokens
                for (let i = 0; i < 9; i++) {
                    tempContractAddress = tokens[i];
                    erc20contr = await ERC20.at(tempContractAddress);

                    //await erc20contr.transfer(accounts[userDeposit], numOfToken);
                    await erc20contr.approve(savingAccount.address, numOfToken);
                    //await erc20contr.approve(savingAccount.address, numOfToken);
                    const totalDefinerBalanceBeforeDeposit = await savingAccount.tokenBalance(
                        erc20contr.address
                    );

                    await savingAccount.deposit(erc20contr.address, numOfToken);

                    //Verify if deposit was successful
                    const expectedTokensAtSavingAccountContract = numOfToken
                        .mul(new BN(15))
                        .div(new BN(100));
                    const balSavingAccount = await erc20contr.balanceOf(savingAccount.address);
                    expect(expectedTokensAtSavingAccountContract).to.be.bignumber.equal(
                        balSavingAccount
                    );

                    // Validate the total balance on DeFiner after deposit
                    const totalDefinerBalanceAfterDeposit = await savingAccount.tokenBalance(
                        erc20contr.address
                    );

                    const totalDefinerBalanceChange = new BN(
                        totalDefinerBalanceAfterDeposit[0]
                    ).sub(new BN(totalDefinerBalanceBeforeDeposit[0]));
                    expect(totalDefinerBalanceChange).to.be.bignumber.equal(numOfToken);
                }

                await time.increase(ONE_WEEK);

                for (let j = 0; j < 9; j++) {
                    tempContractAddress = tokens[j];
                    erc20contr = await ERC20.at(tempContractAddress);

                    await savingAccount.withdrawAll(erc20contr.address);

                    //Verify if withdrawAll was successful
                    const balSavingAccount = await erc20contr.balanceOf(savingAccount.address);
                    expect(ZERO).to.be.bignumber.equal(balSavingAccount);

                    // Verify DeFiner balance
                    const totalDefinerBalancAfterWithdraw = await savingAccount.tokenBalance(
                        erc20contr.address
                    );
                    expect(ZERO).to.be.bignumber.equal(totalDefinerBalancAfterWithdraw[0]);
                }
            });

            it("should deposit and withdraw with interest");
        });
    });

    context("Deposit and Borrow", async () => {
        context("should succeed", async () => {
            it("should deposit $1 million value and borrow 0.6 million", async () => {
                const numOfToken = eighteenPrecision.mul(new BN(10).pow(new BN(6)));
                const numOfUSDC = sixPrecision.mul(new BN(10).pow(new BN(7)));
                const borrowTokens = eighteenPrecision
                    .mul(new BN(6))
                    .mul(new BN(10).pow(new BN(5)));

                // Transfer 1 million DAI tokens (18 decimals) to user1
                await erc20DAI.transfer(user1, numOfToken);

                // Transfer 1 million USDC tokens (6 decimals) to user2
                await erc20USDC.transfer(user2, numOfUSDC);

                await erc20DAI.approve(savingAccount.address, numOfToken, { from: user1 });
                await erc20USDC.approve(savingAccount.address, numOfUSDC, { from: user2 });
                const totalDefinerBalanceBeforeDepositDAI = await savingAccount.tokenBalance(
                    erc20DAI.address,
                    { from: user1 }
                );
                const totalDefinerBalanceBeforeDepositUSDC = await savingAccount.tokenBalance(
                    erc20USDC.address,
                    { from: user2 }
                );

                // 1. Deposit $1 million
                await savingAccount.deposit(addressDAI, numOfToken, { from: user1 });
                await savingAccount.deposit(addressUSDC, numOfUSDC, { from: user2 });

                //Verify if deposit was successful
                const expectedTokensAtSavingAccountContractDAI = numOfToken
                    .mul(new BN(15))
                    .div(new BN(100));
                const balSavingAccountDAI = await erc20DAI.balanceOf(savingAccount.address);
                expect(expectedTokensAtSavingAccountContractDAI).to.be.bignumber.equal(
                    balSavingAccountDAI
                );

                const expectedTokensAtSavingAccountContractUSDC = numOfUSDC
                    .mul(new BN(15))
                    .div(new BN(100));
                const balSavingAccountUSDC = await erc20USDC.balanceOf(savingAccount.address);
                expect(expectedTokensAtSavingAccountContractUSDC).to.be.bignumber.equal(
                    balSavingAccountUSDC
                );

                // Validate the total balance on DeFiner after deposit
                const totalDefinerBalanceAfterDepositDAI = await savingAccount.tokenBalance(
                    erc20DAI.address,
                    { from: user1 }
                );
                const totalDefinerBalanceChangeDAI = new BN(
                    totalDefinerBalanceAfterDepositDAI[0]
                ).sub(new BN(totalDefinerBalanceBeforeDepositDAI[0]));
                expect(totalDefinerBalanceChangeDAI).to.be.bignumber.equal(numOfToken);

                const totalDefinerBalanceAfterDepositUSDC = await savingAccount.tokenBalance(
                    erc20USDC.address,
                    { from: user2 }
                );
                const totalDefinerBalanceChangeUSDC = new BN(
                    totalDefinerBalanceAfterDepositUSDC[0]
                ).sub(new BN(totalDefinerBalanceBeforeDepositUSDC[0]));
                expect(totalDefinerBalanceChangeUSDC).to.be.bignumber.equal(numOfUSDC);

                // 2. Borrow $0.6 million
                await savingAccount.borrow(addressDAI, borrowTokens, { from: user2 });
                // 3. Verify the amount borrowed
                const user2Balance = await erc20DAI.balanceOf(user2);
                expect(user2Balance).to.be.bignumber.equal(borrowTokens);

                const totalDefinerBalanceAfterBorrowtDAIUser1 = await savingAccount.tokenBalance(
                    erc20DAI.address,
                    { from: user1 }
                );
                expect(totalDefinerBalanceAfterBorrowtDAIUser1[0]).to.be.bignumber.equal(
                    numOfToken
                );

                const totalDefinerBalanceAfterBorrowtDAIUser2 = await savingAccount.tokenBalance(
                    erc20DAI.address,
                    { from: user2 }
                );
                expect(totalDefinerBalanceAfterBorrowtDAIUser2[1]).to.be.bignumber.equal(
                    borrowTokens
                );
            });

            it("should allow the borrow of tokens which are more than reserve if user has enough collateral", async () => {
                //user1 deposits 1000 full tokens of DAI
                //user2 deposits 1000 full of USDC
                //user1 borrows 300 full tokens of USDC which are more than reserve(150 full tokens)
                const numOfDAI = eighteenPrecision.mul(new BN(1000));
                const numOfUSDC = sixPrecision.mul(new BN(1000));
                const borrowAmount = sixPrecision.mul(new BN(300));
                const totalDefinerBalanceBeforeDepositDAI = await savingAccount.tokenBalance(
                    erc20DAI.address,
                    { from: user1 }
                );
                const totalDefinerBalanceBeforeDepositUSDC = await savingAccount.tokenBalance(
                    erc20USDC.address,
                    { from: user2 }
                );

                await erc20DAI.transfer(user1, numOfDAI);
                await erc20USDC.transfer(user2, numOfUSDC);
                await erc20DAI.approve(savingAccount.address, numOfDAI, { from: user1 });
                await erc20USDC.approve(savingAccount.address, numOfUSDC, { from: user2 });

                //1. Deposit DAI
                await savingAccount.deposit(addressDAI, numOfDAI, { from: user1 });
                await savingAccount.deposit(addressUSDC, numOfUSDC, { from: user2 });

                // Validate the total balance on DeFiner after deposit
                const totalDefinerBalanceAfterDepositDAI = await savingAccount.tokenBalance(
                    erc20DAI.address,
                    { from: user1 }
                );
                const totalDefinerBalanceChangeDAI = new BN(
                    totalDefinerBalanceAfterDepositDAI[0]
                ).sub(new BN(totalDefinerBalanceBeforeDepositDAI[0]));
                expect(totalDefinerBalanceChangeDAI).to.be.bignumber.equal(numOfDAI);

                const totalDefinerBalanceAfterDepositUSDC = await savingAccount.tokenBalance(
                    erc20USDC.address,
                    { from: user2 }
                );
                const totalDefinerBalanceChangeUSDC = new BN(
                    totalDefinerBalanceAfterDepositUSDC[0]
                ).sub(new BN(totalDefinerBalanceBeforeDepositUSDC[0]));
                expect(totalDefinerBalanceChangeUSDC).to.be.bignumber.equal(numOfUSDC);

                const user1BalanceBeforeBorrow = await erc20USDC.balanceOf(user1);

                // 2. Borrow USDC
                await savingAccount.borrow(addressUSDC, borrowAmount, {
                    from: user1
                });

                // 3. Verify the loan amount
                const user1Balance = await erc20USDC.balanceOf(user1);
                const user1BalanceChange = new BN(user1Balance).sub(
                    new BN(user1BalanceBeforeBorrow)
                );
                expect(user1BalanceChange).to.be.bignumber.equal(borrowAmount);

                const totalDefinerBalanceAfterBorrowtDAIUser1 = await savingAccount.tokenBalance(
                    erc20DAI.address,
                    { from: user1 }
                );
                expect(totalDefinerBalanceAfterBorrowtDAIUser1[0]).to.be.bignumber.equal(numOfDAI);

                const totalDefinerBalanceAfterBorrowUSDCUser1 = await savingAccount.tokenBalance(
                    erc20USDC.address,
                    { from: user1 }
                );
                expect(totalDefinerBalanceAfterBorrowUSDCUser1[1]).to.be.bignumber.equal(
                    borrowAmount
                );
            });

            it("should deposit DAI and borrow USDC tokens whose amount is equal to ILTV of collateral", async () => {
                // 1. Initiate deposit
                const numOfDAI = eighteenPrecision.mul(new BN(1000));
                const numOfUSDC = sixPrecision.mul(new BN(1000));
                const totalDefinerBalanceBeforeDepositDAI = await savingAccount.tokenBalance(
                    erc20DAI.address,
                    { from: user1 }
                );
                const totalDefinerBalanceBeforeDepositUSDC = await savingAccount.tokenBalance(
                    erc20USDC.address,
                    { from: user2 }
                );

                await erc20DAI.transfer(user1, numOfDAI);
                await erc20USDC.transfer(user2, numOfUSDC);
                await erc20DAI.approve(savingAccount.address, numOfDAI, { from: user1 });
                await erc20USDC.approve(savingAccount.address, numOfUSDC, { from: user2 });
                await savingAccount.deposit(addressDAI, numOfDAI, { from: user1 });
                await savingAccount.deposit(addressUSDC, numOfUSDC, { from: user2 });

                // Validate the total balance on DeFiner after deposit
                const totalDefinerBalanceAfterDepositDAI = await savingAccount.tokenBalance(
                    erc20DAI.address,
                    { from: user1 }
                );
                const totalDefinerBalanceChangeDAI = new BN(
                    totalDefinerBalanceAfterDepositDAI[0]
                ).sub(new BN(totalDefinerBalanceBeforeDepositDAI[0]));
                expect(totalDefinerBalanceChangeDAI).to.be.bignumber.equal(numOfDAI);

                const totalDefinerBalanceAfterDepositUSDC = await savingAccount.tokenBalance(
                    erc20USDC.address,
                    { from: user2 }
                );
                const totalDefinerBalanceChangeUSDC = new BN(
                    totalDefinerBalanceAfterDepositUSDC[0]
                ).sub(new BN(totalDefinerBalanceBeforeDepositUSDC[0]));
                expect(totalDefinerBalanceChangeUSDC).to.be.bignumber.equal(numOfUSDC);

                // 2. Start borrowing.
                const user1BalanceBeforeBorrow = await erc20USDC.balanceOf(user1);
                const borrowAmount = numOfDAI
                    .mul(sixPrecision)
                    .mul(await savingAccount.getCoinToETHRate(0))
                    .mul(new BN(60))
                    .div(new BN(100))
                    .div(await savingAccount.getCoinToETHRate(1))
                    .div(eighteenPrecision);

                await savingAccount.borrow(addressUSDC, borrowAmount, {
                    from: user1
                });

                // 3. Verify the loan amount.
                const user1Balance = await erc20USDC.balanceOf(user1);
                const user1BalanceChange = new BN(user1Balance).sub(
                    new BN(user1BalanceBeforeBorrow)
                );
                expect(user1BalanceChange).to.be.bignumber.equal(borrowAmount);

                const totalDefinerBalanceAfterBorrowUSDCUser1 = await savingAccount.tokenBalance(
                    erc20USDC.address,
                    { from: user1 }
                );
                expect(totalDefinerBalanceAfterBorrowUSDCUser1[1]).to.be.bignumber.equal(
                    borrowAmount
                );
            });

            it("should deposit DAI and 3 different users should borrow USDC in gaps of 1 month", async () => {
                // 1. User 1 deposits 100,000 USDC
                const numOfUSDC = new BN(100000);
                const numOfToken = new BN(1000);

                await erc20USDC.transfer(user1, numOfUSDC);
                await erc20USDC.approve(savingAccount.address, numOfUSDC, { from: user1 });
                await savingAccount.deposit(addressUSDC, numOfUSDC, { from: user1 });

                // 2. other users to borrow
                for (let u = 2; u <= 4; u++) {
                    const userBorrowIndex = new BN(u);
                    // Amount to be borrowed based upon the userBorrowIndex
                    const borrowAmount = numOfToken.mul(userBorrowIndex.sub(new BN(1)));
                    const depositAmountCollateral = eighteenPrecision.div(new BN(100));
                    const userNumber = accounts[userBorrowIndex];

                    await erc20DAI.transfer(userNumber, depositAmountCollateral);
                    await erc20DAI.approve(savingAccount.address, depositAmountCollateral, {
                        from: userNumber
                    });

                    await savingAccount.deposit(addressDAI, depositAmountCollateral, {
                        from: userNumber
                    });

                    let userDefinerBalanceBeforeBorrow = await savingAccount.tokenBalance(
                        addressUSDC,
                        { from: userNumber }
                    );

                    let userTotalBalanceBeforeDAI = await savingAccount.tokenBalance(addressDAI, {
                        from: userNumber
                    });

                    const balSavingAccount = await erc20DAI.balanceOf(savingAccount.address);
                    const expectedTokensAtSavingAccountContract = depositAmountCollateral
                        .mul(new BN(15))
                        .div(new BN(100));
                    expect(
                        expectedTokensAtSavingAccountContract.mul(userBorrowIndex.sub(new BN(1)))
                    ).to.be.bignumber.equal(balSavingAccount);

                    // Advance blocks by 150
                    //await time.increase(ONE_MONTH);
                    let block = await web3.eth.getBlock("latest");
                    console.log("block_number", block.number);

                    let targetBlock = new BN(block.number).add(new BN(150));

                    await time.advanceBlockTo(targetBlock);

                    let blockAfter = await web3.eth.getBlock("latest");
                    console.log("block_number_After", blockAfter.number);

                    // check for interest rate
                    let userTotalBalanceAfterDAI = await savingAccount.tokenBalance(addressDAI, {
                        from: userNumber
                    });

                    expect(new BN(userTotalBalanceBeforeDAI[0])).to.be.bignumber.equal(
                        new BN(userTotalBalanceAfterDAI[0])
                    );

                    // Start borrowing
                    const userBalanceBeforeBorrow = await erc20USDC.balanceOf(userNumber);
                    await savingAccount.borrow(addressUSDC, borrowAmount, {
                        from: userNumber
                    });

                    let userDefinerBalanceAfterBorrow = await savingAccount.tokenBalance(
                        addressUSDC,
                        { from: userNumber }
                    );
                    const userBalanceAfterBorrow = await erc20USDC.balanceOf(userNumber);
                    const userBalanceDiff = new BN(userBalanceAfterBorrow).sub(
                        new BN(userBalanceBeforeBorrow)
                    );
                    const userDefinerBalanceDiff = new BN(userDefinerBalanceAfterBorrow[1]).sub(
                        new BN(userDefinerBalanceBeforeBorrow[0])
                    );
                    // Verify if borrow was successful
                    expect(borrowAmount).to.be.bignumber.equal(userDefinerBalanceDiff);
                    expect(userBalanceDiff).to.be.bignumber.equal(borrowAmount);
                }
            });
        });
        context("should fail", async () => {
            it("when user deposits USDC, borrows DAI and wants to deposit DAI without repaying", async () => {
                const numOfToken = new BN(2000);
                const depositTokens = new BN(1000);
                const borrowTokens = new BN(600);
                const totalDefinerBalanceBeforeDepositDAI = await savingAccount.tokenBalance(
                    erc20DAI.address,
                    { from: user1 }
                );
                const totalDefinerBalanceBeforeDepositUSDC = await savingAccount.tokenBalance(
                    erc20USDC.address,
                    { from: user2 }
                );

                await erc20DAI.transfer(user1, numOfToken);
                await erc20USDC.transfer(user2, numOfToken);
                await erc20DAI.approve(savingAccount.address, numOfToken, { from: user1 });
                await erc20USDC.approve(savingAccount.address, numOfToken, { from: user2 });

                // 1. Deposit
                await savingAccount.deposit(addressDAI, numOfToken, { from: user1 });
                await savingAccount.deposit(addressUSDC, depositTokens, { from: user2 });

                // Validate the total balance on DeFiner after deposit
                const totalDefinerBalanceAfterDepositDAI = await savingAccount.tokenBalance(
                    erc20DAI.address,
                    { from: user1 }
                );
                const totalDefinerBalanceChangeDAI = new BN(
                    totalDefinerBalanceAfterDepositDAI[0]
                ).sub(new BN(totalDefinerBalanceBeforeDepositDAI[0]));
                expect(totalDefinerBalanceChangeDAI).to.be.bignumber.equal(numOfToken);

                const totalDefinerBalanceAfterDepositUSDC = await savingAccount.tokenBalance(
                    erc20USDC.address,
                    { from: user2 }
                );
                const totalDefinerBalanceChangeUSDC = new BN(
                    totalDefinerBalanceAfterDepositUSDC[0]
                ).sub(new BN(totalDefinerBalanceBeforeDepositUSDC[0]));
                expect(totalDefinerBalanceChangeUSDC).to.be.bignumber.equal(depositTokens);

                const user2BalanceBeforeBorrow = await erc20DAI.balanceOf(user2);
                // 2. Borrow
                await savingAccount.borrow(addressDAI, borrowTokens, { from: user2 });

                // 3. Verify the amount borrowed
                const user2Balance = await erc20DAI.balanceOf(user2);
                expect(
                    new BN(user2Balance).sub(new BN(user2BalanceBeforeBorrow))
                ).to.be.bignumber.equal(borrowTokens);

                const totalDefinerBalanceAfterBorrowUSDCUser2 = await savingAccount.tokenBalance(
                    erc20DAI.address,
                    { from: user2 }
                );
                expect(totalDefinerBalanceAfterBorrowUSDCUser2[1]).to.be.bignumber.equal(
                    borrowTokens
                );

                await expectRevert(
                    savingAccount.deposit(addressDAI, borrowTokens, { from: user2 }),
                    "SafeERC20: low-level call failed -- Reason given: SafeERC20: low-level call failed."
                );
            });
        });
    });

    context("Deposit, Borrow, Repay", async () => {
        context("should succeed", async () => {
            // Borrow and repay of tokens with less than 18 decimals
            it("should deposit DAI, borrow USDC and repay after one month", async () => {
                // 1. Initiate deposit
                const numOfDAI = eighteenPrecision.div(new BN(1000));
                const numOfUSDC = new BN(1000);
                const totalDefinerBalanceBeforeDepositDAI = await savingAccount.tokenBalance(
                    erc20DAI.address,
                    { from: user1 }
                );
                const totalDefinerBalanceBeforeDepositUSDC = await savingAccount.tokenBalance(
                    erc20USDC.address,
                    { from: user2 }
                );

                await erc20DAI.transfer(user1, numOfDAI);
                await erc20USDC.transfer(user2, numOfUSDC);
                await erc20DAI.approve(savingAccount.address, numOfDAI, { from: user1 });
                await erc20USDC.approve(savingAccount.address, numOfUSDC, { from: user2 });
                await savingAccount.deposit(addressDAI, numOfDAI, { from: user1 });
                await savingAccount.deposit(addressUSDC, numOfUSDC, { from: user2 });
                await erc20USDC.approve(savingAccount.address, numOfUSDC, { from: user1 });

                // Validate the total balance on DeFiner after deposit
                const totalDefinerBalanceAfterDepositDAI = await savingAccount.tokenBalance(
                    erc20DAI.address,
                    { from: user1 }
                );
                const totalDefinerBalanceChangeDAI = new BN(
                    totalDefinerBalanceAfterDepositDAI[0]
                ).sub(new BN(totalDefinerBalanceBeforeDepositDAI[0]));
                expect(totalDefinerBalanceChangeDAI).to.be.bignumber.equal(numOfDAI);

                const totalDefinerBalanceAfterDepositUSDC = await savingAccount.tokenBalance(
                    erc20USDC.address,
                    { from: user2 }
                );
                const totalDefinerBalanceChangeUSDC = new BN(
                    totalDefinerBalanceAfterDepositUSDC[0]
                ).sub(new BN(totalDefinerBalanceBeforeDepositUSDC[0]));
                expect(totalDefinerBalanceChangeUSDC).to.be.bignumber.equal(numOfUSDC);

                const user1BalanceBeforeBorrow = await erc20USDC.balanceOf(user1);
                // 2. Start borrowing.
                await savingAccount.borrow(addressUSDC, new BN(100), { from: user1 });
                const user1BalanceBefore = await erc20USDC.balanceOf(user1);

                const totalDefinerBalanceAfterBorrowUSDCUser1 = await savingAccount.tokenBalance(
                    erc20USDC.address,
                    { from: user1 }
                );
                expect(totalDefinerBalanceAfterBorrowUSDCUser1[1]).to.be.bignumber.equal(
                    new BN(100)
                );

                const user1BalanceBeforeRepay = await erc20USDC.balanceOf(user1);
                // 3. Start repayment.
                await time.increase(new BN(30).mul(new BN(24).mul(new BN(3600))));
                await savingAccount.repay(addressUSDC, new BN(100), { from: user1 });

                // 4. Verify the repay amount.
                const user1BalanceAfter = await erc20USDC.balanceOf(user1);
                expect(
                    new BN(user1BalanceBefore).sub(new BN(user1BalanceBeforeBorrow))
                ).to.be.bignumber.equal(new BN(100));
                // 912949920
                //expect(user1BalanceAfter).to.be.bignumber.equal(ZERO);

                const totalDefinerBalanceAfterRepayUSDCUser1 = await savingAccount.tokenBalance(
                    erc20USDC.address,
                    { from: user1 }
                );
                expect(totalDefinerBalanceAfterRepayUSDCUser1[1]).to.be.bignumber.equal(ZERO);
            });

            it("User 1 should deposit USDC, multiple users should borrow USDC and repay after 1 week", async () => {
                // TODO:
                /* const numOfDAI = eighteenPrecision.div(new BN(1000));
                const numOfToken = new BN(100000);
                const borrowAmount = new BN(1000);

                await erc20DAI.transfer(user1, numOfDAI);
                await erc20USDC.transfer(user2, numOfToken);
                await erc20DAI.approve(savingAccount.address, numOfDAI, { from: user1 });
                await erc20USDC.approve(savingAccount.address, numOfToken, { from: user2 });
                await savingAccount.deposit(addressDAI, numOfDAI, { from: user1 });
                await savingAccount.deposit(addressUSDC, numOfToken, { from: user2 });
                await erc20USDC.approve(savingAccount.address, numOfToken, { from: user1 });

                // 2. Start borrowing.
                await savingAccount.borrow(addressUSDC, borrowAmount, { from: user1 });
                const user1BalanceBefore = await erc20USDC.balanceOf(user1);

                // 3. Start repayment.
                await time.increase(new BN(30).mul(new BN(24).mul(new BN(3600))));
                await savingAccount.repay(addressUSDC, borrowAmount, { from: user1 });

                // 4. Verify the repay amount.
                const user1BalanceAfter = await erc20USDC.balanceOf(user1);
                expect(user1BalanceBefore).to.be.bignumber.equal(borrowAmount);
                expect(user1BalanceAfter).to.be.bignumber.equal(new BN(0)); */
                /*const numOfUSDC = new BN(100000);
                const numOfToken = new BN(1000);

                await erc20USDC.transfer(user1, sixPrecision);
                await erc20USDC.approve(savingAccount.address, sixPrecision, { from: user1 });
                await savingAccount.deposit(addressUSDC, sixPrecision, { from: user1 });
                let u = 2;

                const userBorrowIndex = new BN(u);
                const borrowAmount = numOfToken.mul(userBorrowIndex.sub(new BN(1))); //1000
                const depositAmountCollateral = eighteenPrecision; //10**18 DAI
                const userNumber = accounts[userBorrowIndex]; //account 3

                console.log("borrowAmount", borrowAmount);
                console.log("depositAmountCollateral", depositAmountCollateral);
                console.log("userNumber", userNumber);

                await erc20DAI.transfer(userNumber, depositAmountCollateral);
                await erc20DAI.approve(savingAccount.address, depositAmountCollateral, {
                    from: userNumber
                });

                await savingAccount.deposit(addressDAI, depositAmountCollateral, {
                    from: userNumber
                });

                const userBalanceBeforeBorrow = await erc20USDC.balanceOf(userNumber);
                await savingAccount.borrow(addressUSDC, borrowAmount, {
                    from: userNumber
                });

                await time.increase(ONE_WEEK);
                await savingAccount.repay(addressUSDC, borrowAmount, {
                    from: userNumber
                });

                const userBalanceAfterBorrow = await erc20USDC.balanceOf(userNumber);
                    const userBalanceDiff = new BN(userBalanceAfterBorrow).sub(
                        new BN(userBalanceBeforeBorrow)
                    );
                    expect(userBalanceDiff).to.be.bignumber.equal(borrowAmount);

                //console.log("balSavingAccount", balSavingAccount);
                console.log("borrowAmount", borrowAmount);
                console.log("depositAmountCollateral", depositAmountCollateral);
                console.log("userNumber", userNumber);

                // 2. other users to borrow
                    for (let u = 2; u <= 4; u++) {
                    console.log("user", u);

                    const userBorrowIndex = new BN(u);
                    const borrowAmount = numOfToken.mul(userBorrowIndex.sub(new BN(1)));
                    const depositAmountCollateral = eighteenPrecision;
                    const userNumber = accounts[userBorrowIndex];

                    console.log("borrowAmount", borrowAmount);
                    console.log("depositAmountCollateral", depositAmountCollateral);
                    console.log("userNumber", userNumber);

                    await erc20DAI.transfer(userNumber, depositAmountCollateral);
                    await erc20DAI.approve(savingAccount.address, depositAmountCollateral, {
                        from: userNumber
                    });

                    await savingAccount.deposit(addressDAI, depositAmountCollateral, {
                        from: userNumber
                    });

                    const userBalanceBeforeBorrow = await erc20USDC.balanceOf(userNumber);
                    await savingAccount.borrow(addressUSDC, borrowAmount, {
                        from: userNumber
                    });

                    await time.increase(ONE_WEEK);
                    await savingAccount.repay(addressUSDC, borrowAmount, {
                        from: userNumber
                    });

                    const userBalanceAfterBorrow = await erc20USDC.balanceOf(userNumber);
                    const userBalanceDiff = new BN(userBalanceAfterBorrow).sub(
                        new BN(userBalanceBeforeBorrow)
                    );
                    expect(userBalanceDiff).to.be.bignumber.equal(borrowAmount);

                    //console.log("balSavingAccount", balSavingAccount);
                    console.log("borrowAmount", borrowAmount);
                    console.log("depositAmountCollateral", depositAmountCollateral);
                    console.log("userNumber", userNumber);
                } */
            });
        });
        context("should fail", async () => {});
    });

    context("Deposit, Borrow and Withdraw", async () => {
        context("should succeed", async () => {
            it("should deposit DAI, borrow USDC, allow rest DAI amount to withdraw", async () => {
                const numOfDAI = eighteenPrecision.mul(new BN(10));
                const numOfUSDC = sixPrecision.mul(new BN(10));
                const borrowAmount = numOfUSDC.div(new BN(10));
                const totalDefinerBalanceBeforeDepositDAI = await savingAccount.tokenBalance(
                    erc20DAI.address,
                    { from: user1 }
                );
                const totalDefinerBalanceBeforeDepositUSDC = await savingAccount.tokenBalance(
                    erc20USDC.address,
                    { from: user2 }
                );

                await erc20DAI.transfer(user1, numOfDAI);
                await erc20USDC.transfer(user2, numOfUSDC);
                await erc20DAI.approve(savingAccount.address, numOfDAI, { from: user1 });
                await erc20USDC.approve(savingAccount.address, numOfUSDC, { from: user2 });

                //1. Deposit DAI
                await savingAccount.deposit(addressDAI, numOfDAI, { from: user1 });
                await savingAccount.deposit(addressUSDC, numOfUSDC, { from: user2 });

                const balSavingAccountDAIAfterDeposit = await erc20DAI.balanceOf(
                    savingAccount.address
                );
                // Validate the total balance on DeFiner after deposit
                const totalDefinerBalanceAfterDepositDAI = await savingAccount.tokenBalance(
                    erc20DAI.address,
                    { from: user1 }
                );
                const totalDefinerBalanceChangeDAI = new BN(
                    totalDefinerBalanceAfterDepositDAI[0]
                ).sub(new BN(totalDefinerBalanceBeforeDepositDAI[0]));
                expect(totalDefinerBalanceChangeDAI).to.be.bignumber.equal(numOfDAI);

                const totalDefinerBalanceAfterDepositUSDC = await savingAccount.tokenBalance(
                    erc20USDC.address,
                    { from: user2 }
                );
                const totalDefinerBalanceChangeUSDC = new BN(
                    totalDefinerBalanceAfterDepositUSDC[0]
                ).sub(new BN(totalDefinerBalanceBeforeDepositUSDC[0]));
                expect(totalDefinerBalanceChangeUSDC).to.be.bignumber.equal(numOfUSDC);

                const user1BalanceBeforeBorrow = await erc20USDC.balanceOf(user1);
                // 2. Borrow USDC
                await savingAccount.borrow(addressUSDC, borrowAmount, { from: user1 });

                const balSavingAccountDAIAfterBorrow = await erc20DAI.balanceOf(
                    savingAccount.address
                );

                // Amount that is locked as collateral
                const collateralLocked = borrowAmount
                    .mul(eighteenPrecision)
                    .mul(await savingAccount.getCoinToETHRate(1))
                    .mul(new BN(100))
                    .div(new BN(60))
                    .div(await savingAccount.getCoinToETHRate(0))
                    .div(sixPrecision);

                // 3. Verify the loan amount
                const user1BalanceAfterBorrow = await erc20USDC.balanceOf(user1);
                expect(
                    new BN(user1BalanceAfterBorrow).sub(new BN(user1BalanceBeforeBorrow))
                ).to.be.bignumber.equal(borrowAmount);

                const totalDefinerBalanceAfterBorrowUSDCUser1 = await savingAccount.tokenBalance(
                    erc20USDC.address,
                    { from: user1 }
                );
                expect(totalDefinerBalanceAfterBorrowUSDCUser1[1]).to.be.bignumber.equal(
                    borrowAmount
                );

                // Total remaining DAI after borrow
                const remainingDAI = numOfDAI.sub(new BN(collateralLocked));

                // 4. Withdraw remaining DAI
                await savingAccount.withdraw(erc20DAI.address, remainingDAI, { from: user1 });
                /* const balSavingAccountDAI = await erc20DAI.balanceOf(savingAccount.address);
                expect(balSavingAccountDAI).to.be.bignumber.equal(
                    collateralLocked.mul(new BN(15)).div(new BN(100))
                ); */

                const totalDefinerBalanceAfterWithdrawDAIUser1 = await savingAccount.tokenBalance(
                    erc20DAI.address,
                    { from: user1 }
                );
                expect(totalDefinerBalanceAfterWithdrawDAIUser1[0]).to.be.bignumber.equal(
                    collateralLocked
                );
            });

            // TODO: replace this with the new test case..
            it("should deposit DAI and borrow DAI only after withdrawing first", async () => {
                /* const numOfToken = new BN(1000);
                // 1. Transfer 1000 DAI to user 1 & 2, 1000 USDC to user 1
                await erc20DAI.transfer(user1, numOfDAI);
                await erc20USDC.transfer(user1, numOfUSDC);
                await erc20DAI.transfer(user2, numOfDAI);
                await erc20DAI.approve(savingAccount.address, numOfDAI, { from: user1 });
                await erc20USDC.approve(savingAccount.address, numOfUSDC, { from: user1 });
                await erc20DAI.approve(savingAccount.address, numOfDAI, { from: user2 });
                let userBalanceBeforeDeposit = await erc20DAI.balanceOf(user1);

                // 2. User 1 & 2 deposit DAI
                await savingAccount.deposit(addressDAI, numOfDAI, { from: user1 });
                await savingAccount.deposit(addressDAI, numOfDAI, { from: user2 });

                // Verify deposit
                const expectedTokensAtSavingAccountContract = numOfDAI
                    .mul(new BN(15))
                    .div(new BN(100));
                const balSavingAccount = await erc20DAI.balanceOf(savingAccount.address);
                expect(expectedTokensAtSavingAccountContract.mul(new BN(2))).to.be.bignumber.equal(
                    balSavingAccount
                );

                // 3. User 1 tries to borrow DAI
                await savingAccount.borrow(addressDAI, new BN(100), {
                    from: user1
                });


                // 4. User 1 withdraws all DAI
                await savingAccount.withdrawAll(erc20DAI.address, { from: user1 });
                let userBalanceAfterWithdraw = await erc20DAI.balanceOf(user1);

                // 4.1 Verify if withdraw was successful
                expect(new BN(userBalanceBeforeDeposit).add(new BN(100))).to.be.bignumber.equal(
                    userBalanceAfterWithdraw
                );

                // 5. Deposit USDC and borrow DAI
                await savingAccount.deposit(addressUSDC, numOfUSDC, { from: user1 });
                const limitAmount = numOfUSDC
                    .mul(eighteenPrecision)
                    .mul(await savingAccount.getCoinToETHRate(1))
                    .mul(new BN(50))
                    .div(new BN(100))
                    .div(await savingAccount.getCoinToETHRate(0))
                    .div(sixPrecision);
                await savingAccount.borrow(addressDAI, limitAmount, { from: user1 });
                let userBalanceAfterBorrow = await erc20DAI.balanceOf(user1);
                let expectedBalanceAfterBorrow = new BN(userBalanceAfterWithdraw).add(limitAmount);

                console.log("limitAmount", limitAmount);

                console.log("userBalanceAfterBorrow", userBalanceAfterBorrow);
                console.log("expectedBalanceAfterBorrow", expectedBalanceAfterBorrow);

                // Verify that borrow was successful
                expect(expectedBalanceAfterBorrow).to.be.bignumber.equal(userBalanceAfterBorrow); */
            });

            it("should get deposit interests when he deposits, wait for a week and withdraw", async () => {});
        });
        context("should fail", async () => {});
    });

    context("Deposit, Borrow and liquidate", async () => {
        it("");
    });

    context("Deposit, Borrow, Repay and liquidate", async () => {
        it("");
    });

    context("Deposit, Borrow, Repay, Withdraw and liquidate", async () => {
        it("");
    });
});
