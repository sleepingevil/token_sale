pragma solidity ^0.5.0;
import "./DconToken.sol";

contract DconTokenSale {
    address admin;
    DconToken public tokenContract;
    uint256 public tokenPrice;

    constructor(DconToken _tokenContract, uint256 _tokenPrice) public {
        tokenContract = _tokenContract;
        admin = msg.sender;
        tokenPrice = _tokenPrice;
    }
}