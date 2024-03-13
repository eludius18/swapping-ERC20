// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/interfaces/IQuoter.sol";

contract Swapper is Initializable, OwnableUpgradeable, PausableUpgradeable {

    ISwapRouter public router; // Uniswap V3 router
    IQuoter public quoter; // Uniswap V3 quoter
    address public WETH; // WETH address
    uint256 public deadline; //  Deadline for the swap

    /// @notice Disables the default constructor
    constructor() {
        _disableInitializers();
    }

    // @notice Initialize the contract
    /// @param _router Address of the Uniswap V3 router
    /// @param _quoter Address of the Uniswap V3 quoter
    /// @param _WETH Address of the WETH
    /// @param _deadline Deadline for the swap
    function initialize(address _router, address _quoter, address _WETH, uint256 _deadline) public initializer {
        router = ISwapRouter(_router);
        quoter = IQuoter(_quoter);
        WETH = _WETH;
        deadline = _deadline;
        __Ownable_init(msg.sender);
        __Pausable_init();
    }

    /// @notice Function to swap ether to token
    /// @param token Address of the token to swap to
    /// @param amountOutMinimum Minimum amount of token to receive
    /// @return amountOut Amount of token received
    function swapEtherToToken(address token, uint256 amountOutMinimum) external
    whenNotPaused()
    payable returns (uint256) 
    {

    require(token != address(0), "Invalid token address");

    uint256 maxDeadline = block.timestamp + deadline;

    ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams(
        WETH,
        token,
        3000,
        msg.sender,
        maxDeadline,
        msg.value,
        amountOutMinimum,
        0
    );

    uint256 amountOut = router.exactInputSingle{value: msg.value}(params);

    require(amountOut > 0, "Swap failed");

    return amountOut;
    }

    /// @notice Function to change the deadline
    /// @param newDeadline New deadline
    function changeDeadline(uint256 newDeadline) public
    onlyOwner()
    {
        deadline = newDeadline;
    }

    /// @notice Function to pause the contract
    function pause() public onlyOwner {
        _pause();
    }

    /// @notice Function to unpause the contract
    function unpause() public onlyOwner {
        _unpause();
    }
}
