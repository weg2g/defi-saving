// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.5.14;

import "@chainlink/contracts/src/v0.5/dev/AggregatorInterface.sol";
import "../registry/TokenRegistryV1.sol";

/**
 */
contract ChainLinkAggregatorV1 {

    TokenRegistryV1 public tokenRegistry;

    /**
     * Constructor
     */
    constructor(TokenRegistryV1 _tokenRegistry) public {
        require(address(_tokenRegistry) != address(0), "TokenRegistry address is zero");
        tokenRegistry = _tokenRegistry;
    }

    /**
     * Get latest update from the aggregator
     * @param _token token address
     */
    function getLatestAnswer(address _token) public view returns (int256) {
        return getAggregator(_token).latestAnswer();
    }

    /**
     * Get the timestamp of the latest update
     * @param _token token address
     */
    function getLatestTimestamp(address _token) public view returns (uint256) {
        return getAggregator(_token).latestTimestamp();
    }

    /**
     * Get the previous update
     * @param _token token address
     * @param _back the position of the answer if counting back from the latest
     */
    function getPreviousAnswer(address _token, uint256 _back) public view returns (int256) {
        AggregatorInterface aggregator = getAggregator(_token);
        uint256 latest = aggregator.latestRound();
        require(_back <= latest, "Not enough history");
        return aggregator.getAnswer(latest - _back);
    }

    /**
     * Get the timestamp of the previous update
     * @param _token token address
     * @param _back the position of the answer if counting back from the latest
     */
    function getPreviousTimestamp(address _token, uint256 _back) public view returns (uint256) {
        AggregatorInterface aggregator = getAggregator(_token);
        uint256 latest = aggregator.latestRound();
        require(_back <= latest, "Not enough history");
        return aggregator.getTimestamp(latest - _back);
    }

    /**
     * Get the aggregator address
     * @param _token token address
     */
    function getAggregator(address _token) internal view returns (AggregatorInterface) {
        return AggregatorInterface(tokenRegistry.getChainLinkAggregator(_token));
    }
}
