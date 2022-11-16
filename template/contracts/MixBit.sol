pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MixBit is ERC20 {
    constructor() ERC20("MixBit", "MBS") {
        _mint(msg.sender, 800 * 10**18);
    }
}
