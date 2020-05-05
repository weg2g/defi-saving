/* Generated by ts-generator ver. 0.0.8 */
/* tslint:disable */

/// <reference types="truffle-typings" />

import * as TruffleContracts from ".";

declare global {
  namespace Truffle {
    interface Artifacts {
      require(
        name: "AggregatorInterface"
      ): TruffleContracts.AggregatorInterfaceContract;
      require(name: "Base"): TruffleContracts.BaseContract;
      require(name: "CETH"): TruffleContracts.CETHContract;
      require(
        name: "ChainLinkOracle"
      ): TruffleContracts.ChainLinkOracleContract;
      require(name: "Config"): TruffleContracts.ConfigContract;
      require(name: "Context"): TruffleContracts.ContextContract;
      require(name: "CToken"): TruffleContracts.CTokenContract;
      require(name: "CTokenRegistry"): TruffleContracts.CTokenRegistryContract;
      require(name: "ERC20"): TruffleContracts.ERC20Contract;
      require(name: "ERC20Burnable"): TruffleContracts.ERC20BurnableContract;
      require(name: "ERC20Detailed"): TruffleContracts.ERC20DetailedContract;
      require(name: "ERC20Mintable"): TruffleContracts.ERC20MintableContract;
      require(name: "ICToken"): TruffleContracts.ICTokenContract;
      require(name: "IERC20"): TruffleContracts.IERC20Contract;
      require(name: "Migrations"): TruffleContracts.MigrationsContract;
      require(name: "MinterRole"): TruffleContracts.MinterRoleContract;
      require(
        name: "MockChainLinkAggregator"
      ): TruffleContracts.MockChainLinkAggregatorContract;
      require(name: "MockCToken"): TruffleContracts.MockCTokenContract;
      require(name: "MockERC20"): TruffleContracts.MockERC20Contract;
      require(name: "Ownable"): TruffleContracts.OwnableContract;
      require(name: "SavingAccount"): TruffleContracts.SavingAccountContract;
      require(
        name: "SavingAccountParameters"
      ): TruffleContracts.SavingAccountParametersContract;
      require(name: "TestToken"): TruffleContracts.TestTokenContract;
      require(name: "TokenRegistry"): TruffleContracts.TokenRegistryContract;
    }
  }
}
