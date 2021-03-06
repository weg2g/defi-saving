import * as t from "../../../types/truffle-contracts/index";
import { TestEngine } from "../../../test-helpers/TestEngine";
import { savAccBalVerify } from "../../../test-helpers/lib/lib";

var chai = require("chai");
var expect = chai.expect;
var tokenData = require("../../../test-helpers/tokenData.json");

const { BN, expectRevert } = require("@openzeppelin/test-helpers");

const SavingAccount: t.SavingAccountContract = artifacts.require("SavingAccount");
const ERC20: t.MockErc20Contract = artifacts.require("MockERC20");
const MockCToken: t.MockCTokenContract = artifacts.require("MockCToken");
const GlobalConfig: t.GlobalConfigContract = artifacts.require("GlobalConfig");

contract("GlobalConfig", async (accounts) => {
    const ETH_ADDRESS: string = "0x000000000000000000000000000000000000000E";
    const addressZero: string = "0x0000000000000000000000000000000000000000";
    const addressOne: string = "0x0000000000000000000000000000000000000001";
    const sixteenPrecision = new BN(10).pow(new BN(16));
    let testEngine: TestEngine;
    let savingAccount: t.SavingAccountWithControllerInstance;
    let globalConfig: t.GlobalConfigInstance;
    // testEngine = new TestEngine();
    // testEngine.deploy("scriptFlywheel.scen");

    before(function () {
        // Things to initialize before all test
        this.timeout(0);
        testEngine = new TestEngine();
        // testEngine.deploy("scriptFlywheel.scen");
    });

    beforeEach(async function () {
        this.timeout(0);
        savingAccount = await testEngine.deploySavingAccount();
        globalConfig = await testEngine.globalConfig;
        await savingAccount.fastForward(1);
    });

    context("constructor", async () => {
        context("should fail", async () => {
            it("When executing updateCommunityFundRatio, the input parameter is zero.", async function () {
                this.timeout(0);
                await savingAccount.fastForward(1000);
                await expectRevert(
                    globalConfig.updateCommunityFundRatio(new BN(0)),
                    "Invalid community fund ratio."
                );
            });

            it("When executing updateMinReserveRatio, the input parameter is zero.", async function () {
                this.timeout(0);
                await expectRevert(
                    globalConfig.updateMinReserveRatio(new BN(0)),
                    "Invalid min reserve ratio."
                );
            });

            it("When executing updateMinReserveRatio, the input parameter is greater than maxReserveRatio.", async function () {
                this.timeout(0);
                await expectRevert(
                    globalConfig.updateMinReserveRatio(new BN(21)),
                    "Invalid min reserve ratio."
                );
            });

            it("When executing updateMaxReserveRatio, the input parameter is zero.", async function () {
                this.timeout(0);
                await expectRevert(
                    globalConfig.updateMaxReserveRatio(new BN(0)),
                    "Invalid max reserve ratio."
                );
            });

            it("When executing updateMaxReserveRatio, the input parameter is less than minReserveRatio.", async function () {
                this.timeout(0);
                await expectRevert(
                    globalConfig.updateMaxReserveRatio(new BN(9)),
                    "Invalid max reserve ratio."
                );
            });

            it("When executing updateLiquidationThreshold, the input parameter is zero.", async function () {
                this.timeout(0);
                await expectRevert(
                    globalConfig.updateLiquidationThreshold(new BN(0)),
                    "Invalid liquidation threshold."
                );
            });

            it("When executing updateLiquidationDiscountRatio, the input parameter is zero.", async function () {
                this.timeout(0);
                await expectRevert(
                    globalConfig.updateLiquidationDiscountRatio(new BN(0)),
                    "Invalid liquidation discount ratio."
                );
            });
        });

        context("should succeed", async () => {
            it("executing updateCommunityFundRatio", async function () {
                this.timeout(0);
                const beforeCommunityFundRatio = await globalConfig.communityFundRatio();
                await globalConfig.updateCommunityFundRatio(new BN(20));
                const afterCommunityFundRatio = await globalConfig.communityFundRatio();
                expect(beforeCommunityFundRatio).to.be.bignumber.equal(new BN(10));
                expect(afterCommunityFundRatio).to.be.bignumber.equal(new BN(20));
            });

            it("executing updateMinReserveRatio", async function () {
                this.timeout(0);
                const beforeMinReserveRatio = await globalConfig.minReserveRatio();
                await globalConfig.updateMinReserveRatio(new BN(15));
                const afterMinReserveRatio = await globalConfig.minReserveRatio();
                expect(beforeMinReserveRatio).to.be.bignumber.equal(new BN(10));
                expect(afterMinReserveRatio).to.be.bignumber.equal(new BN(15));
            });

            it("executing updateMaxReserveRatio", async function () {
                this.timeout(0);
                const beforeMaxReserveRatio = await globalConfig.maxReserveRatio();
                await globalConfig.updateMaxReserveRatio(new BN(25));
                const afterMaxReserveRatio = await globalConfig.maxReserveRatio();
                expect(beforeMaxReserveRatio).to.be.bignumber.equal(new BN(20));
                expect(afterMaxReserveRatio).to.be.bignumber.equal(new BN(25));
            });

            it("executing updateLiquidationThreshold", async function () {
                this.timeout(0);
                const beforeLiquidationThreshold = await globalConfig.liquidationThreshold();
                await globalConfig.updateLiquidationThreshold(new BN(20));
                const afterLiquidationThreshold = await globalConfig.liquidationThreshold();
                expect(beforeLiquidationThreshold).to.be.bignumber.equal(new BN(85));
                expect(afterLiquidationThreshold).to.be.bignumber.equal(new BN(20));
            });

            it("executing updateLiquidationDiscountRatio", async function () {
                this.timeout(0);
                const beforeLiquidationDiscountRatio =
                    await globalConfig.liquidationDiscountRatio();
                await globalConfig.updateLiquidationThreshold(new BN(10));
                await globalConfig.updateLiquidationDiscountRatio(new BN(20));
                const afterLiquidationDiscountRatio = await globalConfig.liquidationDiscountRatio();
                expect(beforeLiquidationDiscountRatio).to.be.bignumber.equal(new BN(95));
                expect(afterLiquidationDiscountRatio).to.be.bignumber.equal(new BN(20));
            });

            it("executing midReserveRatio", async function () {
                this.timeout(0);
                const beforeLiquidationDiscountRatio = await globalConfig.midReserveRatio();
                await globalConfig.updateMinReserveRatio(new BN(15));
                await globalConfig.updateMaxReserveRatio(new BN(25));
                const afterLiquidationDiscountRatio = await globalConfig.midReserveRatio();
                expect(beforeLiquidationDiscountRatio).to.be.bignumber.equal(new BN(15));
                expect(afterLiquidationDiscountRatio).to.be.bignumber.equal(new BN(20));
            });

            it("executing updateCompoundSupplyRateWeights", async function () {
                this.timeout(0);
                const beforeCompoundSupplyRateWeights =
                    await globalConfig.compoundSupplyRateWeights();
                await globalConfig.updateCompoundSupplyRateWeights(new BN(5));
                const afterCompoundSupplyRateWeights =
                    await globalConfig.compoundSupplyRateWeights();
                expect(beforeCompoundSupplyRateWeights).to.be.bignumber.equal(new BN(4));
                expect(afterCompoundSupplyRateWeights).to.be.bignumber.equal(new BN(5));
            });

            it("executing updateCompoundBorrowRateWeights", async function () {
                this.timeout(0);
                const beforeCompoundBorrowRateWeights =
                    await globalConfig.compoundBorrowRateWeights();
                await globalConfig.updateCompoundBorrowRateWeights(new BN(7));
                const afterCompoundBorrowRateWeights =
                    await globalConfig.compoundBorrowRateWeights();
                expect(beforeCompoundBorrowRateWeights).to.be.bignumber.equal(new BN(6));
                expect(afterCompoundBorrowRateWeights).to.be.bignumber.equal(new BN(7));
            });

            it("executing updaterateCurveSlope", async function () {
                this.timeout(0);
                const beforeRateCurveSlope = await globalConfig.rateCurveSlope();
                await globalConfig.updaterateCurveSlope(new BN(14).mul(sixteenPrecision));
                const afterRateCurveSlope = await globalConfig.rateCurveSlope();
                expect(beforeRateCurveSlope).to.be.bignumber.equal(
                    new BN(15).mul(sixteenPrecision)
                );
                expect(afterRateCurveSlope).to.be.bignumber.equal(new BN(14).mul(sixteenPrecision));
            });

            it("executing updaterateCurveConstant", async function () {
                this.timeout(0);
                const beforeRateCurveConstant = await globalConfig.rateCurveConstant();
                await globalConfig.updaterateCurveConstant(new BN(5).mul(sixteenPrecision));
                const afterRateCurveConstant = await globalConfig.rateCurveConstant();
                expect(beforeRateCurveConstant).to.be.bignumber.equal(
                    new BN(3).mul(sixteenPrecision)
                );
                expect(afterRateCurveConstant).to.be.bignumber.equal(
                    new BN(5).mul(sixteenPrecision)
                );
            });

            it("executing updateBank", async function () {
                this.timeout(0);
                await globalConfig.updateBank(addressOne);
                const afterBank = await globalConfig.bank();
                expect(afterBank).to.be.bignumber.equal(addressOne);
            });

            it("executing updateSavingAccount", async function () {
                this.timeout(0);
                await globalConfig.updateSavingAccount(addressOne);
                const afterSavingAccount = await globalConfig.savingAccount();
                expect(afterSavingAccount).to.be.bignumber.equal(addressOne);
            });

            it("executing updateTokenInfoRegistry", async function () {
                this.timeout(0);
                await globalConfig.updateTokenInfoRegistry(addressOne);
                const afterTokenInfoRegistry = await globalConfig.tokenInfoRegistry();
                expect(afterTokenInfoRegistry).to.be.bignumber.equal(addressOne);
            });

            it("executing updateAccounts", async function () {
                this.timeout(0);
                await globalConfig.updateAccounts(addressOne);
                const afterAccounts = await globalConfig.accounts();
                expect(afterAccounts).to.be.bignumber.equal(addressOne);
            });

            it("executing updateConstant", async function () {
                this.timeout(0);
                await globalConfig.updateConstant(addressOne);
                const afterConstant = await globalConfig.constants();
                expect(afterConstant).to.be.bignumber.equal(addressOne);
            });

            it("executing updatedeFinerCommunityFund", async function () {
                this.timeout(0);
                await globalConfig.updatedeFinerCommunityFund(addressOne);
                const afterDeFinerCommunityFund = await globalConfig.deFinerCommunityFund();
                expect(afterDeFinerCommunityFund).to.be.bignumber.equal(addressOne);
            });
        });
    });
});
