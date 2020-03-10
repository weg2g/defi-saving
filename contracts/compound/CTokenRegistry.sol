pragma solidity >= 0.5.0 < 0.6.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

/**
 * @title Compound Token Registry
 */
contract CTokenRegistry is Ownable {

    event TokenAdded(address indexed token);
    event TokenRemoved(address indexed token);

    mapping(address => bool) public tokens;
    
    function addToken(address _token) external onlyOwner {
        require(tokens[_token] == false, "Token already exist");
        tokens[_token] = true;
        emit TokenAdded(_token);
    }

    function removeToken(address _token) external onlyOwner {
        require(tokens[_token] == true, "Token not exist");
        tokens[_token] = false;
        emit TokenRemoved(_token);
    }

    function isTokenExist(address _token) external view returns (bool isExist) {
        isExist = tokens[_token];
    }
}
