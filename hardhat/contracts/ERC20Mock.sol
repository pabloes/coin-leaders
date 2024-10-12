// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract ERC20Mock is Initializable, ERC20Upgradeable {
    function initialize(
        string memory name,
        string memory symbol,
        address initialAccount,
        uint256 initialBalance
    ) public initializer {
        __ERC20_init(name, symbol);
        _mint(initialAccount, initialBalance);
    }

    function decimals() public view virtual override returns (uint8) {
        return 0;
    }
}