pragma solidity 0.5.14;

import "../SavingAccount.sol";
import { IController } from "../compound/ICompound.sol";

contract SavingAccountWithController  is SavingAccount {

    address comptroller;

    constructor() public {
        // DO NOT ADD ANY LOGIC HERE.
        // THIS IS AN UPGRADABLE CONTRACT
    }

    /**
     * Intialize the contract
     * @param _tokenAddresses list of token addresses
     * @param _cTokenAddresses list of corresponding cToken addresses
     * @param _chainlinkAddress chainlink oracle address
     * @param _tokenRegistry token registry contract
     * @param _globalConfig global configuration contract
     * @param _comptroller Compound controller address
     */
    function initialize(
        address[] memory _tokenAddresses,
        address[] memory _cTokenAddresses,
        address _chainlinkAddress,
        TokenInfoRegistry _tokenRegistry,
        GlobalConfig _globalConfig,
        address _comptroller
    ) public initializer {
        super.initialize(_tokenAddresses, _cTokenAddresses, _chainlinkAddress, _tokenRegistry, _globalConfig);
        comptroller = _comptroller;
    }

    /**
     * Fastfoward for specified block numbers. The block number is synced to compound.
     * @param blocks number of blocks to be forwarded
     */
    function fastForward(uint blocks) public returns (uint) {
        return IController(comptroller).fastForward(blocks);
    }

    /**
     * Get the block number from comound
     */
    function getBlockNumber() public view returns (uint) {
        return IController(comptroller).getBlockNumber();
    }
}