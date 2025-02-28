// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

contract BaseWallet {
    // Адреса власника контракту
    address public owner;

    constructor() public {
        owner = msg.sender;
    }

    // Функція для внесення депозиту (гравці можуть вносити ETH)
    function deposit() public payable {
        require(msg.value > 0, "Deposit must be greater than 0");
        
        // Переказуємо кошти одразу власнику контракту
        payable(owner).transfer(msg.value);
    }
}