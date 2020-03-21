pragma solidity >= 0.5.0 < 0.6.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

/**
 * @title Compound Token Registry
 */
contract CTokenRegistry is Ownable {

    event TokenAdded(address indexed token);
    event TokenRemoved(address indexed token);

    mapping(address => bool) public tokens;
<<<<<<< HEAD
    
=======

    /**
     * @dev Add a new cToken to registry
     * @param _token cToken address
     */
>>>>>>> a983c67eff343846bd601e47d1453257c508091c
    function addToken(address _token) external onlyOwner {
        require(tokens[_token] == false, "Token already exist");
        tokens[_token] = true;
        emit TokenAdded(_token);
    }

<<<<<<< HEAD
=======
    /**
     * @dev Remove a cToken from the registry
     * @param _token cToken address
     */
>>>>>>> a983c67eff343846bd601e47d1453257c508091c
    function removeToken(address _token) external onlyOwner {
        require(tokens[_token] == true, "Token not exist");
        tokens[_token] = false;
        emit TokenRemoved(_token);
    }

<<<<<<< HEAD
=======
    /**
     * @dev Is token address is registered
     * @param _token cToken address
     * @return Returns `true` when cToken registered, otherwise `false`
     */
>>>>>>> a983c67eff343846bd601e47d1453257c508091c
    function isTokenExist(address _token) external view returns (bool isExist) {
        isExist = tokens[_token];
    }
}