// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.5.14;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";

interface mockERC20InterfaceLPV1_1{
    function balanceOf(address owner) external view returns (uint);
    function totalSupply() external view returns (uint256);
}

contract ETHPerLPTokenV1_1 {
    using SafeMath for uint256;
    
    address public WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address public FIN_LP = 0x486792bcdb13F8aaCf85288D98850FA2804F95c7;
    
    function latestAnswer() public view returns (int256){
        uint balance = mockERC20InterfaceLPV1_1(WETH).balanceOf(FIN_LP);
        uint totalSupply = mockERC20InterfaceLPV1_1(FIN_LP).totalSupply();
        return int(balance.mul(2).mul(10 ** 18).div(totalSupply));
    }
}