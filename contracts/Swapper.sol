// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/interfaces/IQuoter.sol";
contract Swapper is Initializable {

    ISwapRouter public router;
    IQuoter public quoter;
    address public WETH;
    uint256 public deadline;

    constructor() {
        _disableInitializers();
    }

    function initialize(address _router, address _quoter, address _WETH, uint256 _deadline) public initializer {
        router = ISwapRouter(_router);
        quoter = IQuoter(_quoter);
        WETH = _WETH;
        deadline = _deadline;
    }

    function swapEtherToToken(address token, uint256 amountOutMinimum) external payable returns (uint256) {

    require(token != address(0), "Invalid token address");

    // deadline as 1 hour from now
    uint256 maxDeadline = block.timestamp + deadline;

    // Estimate the fee using the quoter
    //bytes memory path = abi.encodePacked(WETH, token);
    //uint256 estimatedfee = quoter.quoteExactInput(path, msg.value);

    // Check if the estimated amount out is greater than or equal to the minimum amount out
    //require(estimatedfee >= amountOutMinimum, "Estimated amount out is less than the minimum amount out");

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

// function for changing the deadline
function changeDeadline(uint256 newDeadline) public {
    deadline = newDeadline;
}
}
