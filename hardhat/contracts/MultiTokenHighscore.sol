// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

contract MultiTokenHighscore is Initializable, OwnableUpgradeable, PausableUpgradeable {
    address public receiver;
    uint8 public referrerPercentage;
    uint8 public commPercentage;

    event Deposit(address indexed user, address indexed token, uint256 amount, address referrer, address comm);
    event DepositInfo(address indexed user, address indexed token, string url, string title, string image);
    event ReceiverChanged(address indexed oldReceiver, address indexed newReceiver);
    event ReferrerQuoteChanged(uint8 _old, uint8 _new);
    event CommQuoteChanged(uint8 _old, uint8 _new);
    event MetaEvent(uint256 key, string value);

    modifier onlyReceiverOrOwner() {
        require(msg.sender == receiver || msg.sender == owner(), "Not authorized");
        _;
    }

    function initialize(address _receiver, uint8 _referrerQuote, uint8 _commQuote) public initializer {
        __Ownable_init(msg.sender);
        __Pausable_init();
        receiver = _receiver;
        referrerPercentage = _referrerQuote;
        commPercentage = _commQuote;

        emit ReceiverChanged(address(0), _receiver);
        emit ReferrerQuoteChanged(0, _referrerQuote);
        emit CommQuoteChanged(0, _commQuote);
    }

    function pause() external onlyOwner {
        _pause();
    }
    function unpause() external onlyOwner {
        _unpause();
    }

    function changeReceiver(address newReceiver) external onlyReceiverOrOwner whenNotPaused {
        require(newReceiver != address(0), "New receiver is the zero address");
        emit ReceiverChanged(receiver, newReceiver);
        receiver = newReceiver;
    }

    function deposit(
        address _tokenAddress,
        uint256 _amount,
        string calldata _url,
        string calldata _title,
        string calldata _image,
        address _referrer,
        address _comm
    ) external whenNotPaused {
        require(_amount >= 10, "Deposit amount must be at least 10 wei");

        IERC20 token = IERC20(_tokenAddress);
        uint256 referrerAmount = 0;
        uint256 commAmount = 0;
        uint256 receiverAmount = _amount;

        // Check if a valid referrer is provided
        if (_referrer != address(0)) {
            referrerAmount = (_amount * referrerPercentage) / 100;
            receiverAmount -= referrerAmount;
            require(token.transferFrom(msg.sender, _referrer, referrerAmount), "Referrer token transfer failed");
        }

        if (_comm != address(0)) {
            commAmount = (_amount * commPercentage) / 100;
            receiverAmount -= commAmount;
            require(token.transferFrom(msg.sender, _comm, commAmount), "Comm token transfer failed");
        }

        require(token.transferFrom(msg.sender, receiver, receiverAmount), "Token transfer failed");

        emit Deposit(msg.sender, _tokenAddress, _amount, _referrer, _comm);
        emit DepositInfo(msg.sender, _tokenAddress, _url, _title, _image);
    }

    function handlePercentageTransferETH(uint8 percentage, address target) internal returns (uint256) {
        uint256 targetAmount = 0;
        if (target != address(0)) {
            targetAmount = (msg.value * percentage) / 100;
            (bool targetSent, ) = target.call{value: targetAmount}("");
            require(targetSent, "Failed to send ETH to target");
        }
        return targetAmount;
    }

    function depositETH(
        string calldata _url,
        string calldata _title,
        string calldata _image,
        address _referrer,
        address _comm
    ) public payable whenNotPaused {
        require(msg.value >= 10, "Deposit amount must be at least 10 wei");
        uint256 receiverAmount = msg.value;

        receiverAmount -= handlePercentageTransferETH(referrerPercentage, _referrer);
        receiverAmount -= handlePercentageTransferETH(commPercentage, _comm);

        // Transfer the remaining amount to the receiver
        (bool receiverSent, ) = receiver.call{value: receiverAmount}("");
        require(receiverSent, "Failed to send ETH to receiver");

        emit Deposit(msg.sender, address(0), msg.value, _referrer, _comm);
        emit DepositInfo(msg.sender, address(0), _url, _title, _image);
    }

    function withdrawERC20(address _tokenAddress, uint256 _amount, address recipient) external onlyReceiverOrOwner whenNotPaused {
        require(_amount > 0, "Amount must be greater than 0");
        IERC20 token = IERC20(_tokenAddress);
        token.transfer(recipient, _amount);
    }

    function withdrawETH(uint256 _amount) external onlyReceiverOrOwner whenNotPaused {
        require(_amount > 0, "Amount must be greater than 0");
        (bool sent, ) = receiver.call{value: _amount}("");
        require(sent, "Failed to send ETH");
    }

    function changeReferrerQuote(uint8 _new) external onlyOwner whenNotPaused {
        uint8 _old = referrerPercentage;
        referrerPercentage = _new;
        emit ReferrerQuoteChanged(_old, _new);
    }

    function changeCommQuote(uint8 _new) external onlyOwner whenNotPaused {
        uint8 _old = commPercentage;
        commPercentage = _new;
        emit CommQuoteChanged(_old, _new);
    }

    function emitMetaEvent(uint256 key, string calldata value) external onlyReceiverOrOwner whenNotPaused {
        emit MetaEvent(key, value);
    }
}
