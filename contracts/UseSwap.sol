// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.17;
import "./interfaces/IUniswapV2Router.sol";
import "./interfaces/IERC20.sol";
import "hardhat/console.sol";

// UseSwap contract for handling token swaps
contract UseSwap {

    // Address of the Uniswap router
    address public uniswapRouter;
    // Owner of the contract
    address public owner;
    // Count of successful swaps
    uint public swapCount;

    // Constructor to initialize the Uniswap router and owner
    constructor(address _uniswapRouter) {
        uniswapRouter = _uniswapRouter;
        owner = msg.sender;
    }

    // Function to handle token swaps
    function handleSwap(
        uint amountOut,
        uint amountInMax,
        address[] calldata path,
        address to,
        uint deadline
    ) external {

        // Transfer tokens from the sender to the contract
        IERC20(path[0]).transferFrom(msg.sender, address(this), amountInMax);

        // Approve the Uniswap router to spend the tokens
        require(IERC20(path[0]).approve(uniswapRouter, amountInMax), "approve failed.");
        
        // Swap tokens using the Uniswap router
        IUniswapV2Router(uniswapRouter).swapTokensForExactTokens(
            amountOut,
            amountInMax,
            path,
            to,
            deadline
        );

        // Increment the swap count
        swapCount += 1;
    }

    // Function to handle token swaps for ETH
    function handleSwapForETH(
        uint amountOut,
        uint amountInMax,
        address[] calldata path,
        address to,
        uint deadline
    ) external {

        // Transfer tokens from the sender to the contract
        IERC20(path[0]).transferFrom(msg.sender, address(this), amountInMax);

        // Approve the Uniswap router to spend the tokens
        require(IERC20(path[0]).approve(uniswapRouter, amountInMax), "approve failed.");
        
        // Swap tokens for ETH using the Uniswap router
        IUniswapV2Router(uniswapRouter).swapTokensForExactETH(
            amountOut,
            amountInMax,
            path,
            to,
            deadline
        );

        // Increment the swap count
        swapCount += 1;
    }

    function handleETHSwapForTokens(
    uint amountOutMin,
    address[] calldata path,
    address to,
    uint deadline
    ) external payable {
        // Approve the Uniswap router to spend the tokens
        require(IERC20(path[0]).approve(uniswapRouter, msg.value), "approve failed.");
        require(amountOutMin > 0, "ETH amount must be greater than 0.");
        require(path.length >= 2, "Path must have at least 2 addresses.");

        
        IUniswapV2Router(uniswapRouter).swapExactETHForTokens{ value: msg.value }(
            amountOutMin,
            path,
            to,
            deadline
        );

        swapCount += 1;
}

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external {

        // Transfer tokens from the sender to the contract
        IERC20(tokenA).transferFrom(msg.sender, address(this), amountADesired);
        IERC20(tokenB).transferFrom(msg.sender, address(this), amountBDesired);

        // Approve the Uniswap router to spend the tokens
        require(IERC20(tokenA).approve(uniswapRouter, amountADesired), "approve tokenA failed.");
        require(IERC20(tokenB).approve(uniswapRouter, amountBDesired), "approve tokenB failed.");
        
        // Add liquidity using the Uniswap router
        IUniswapV2Router(uniswapRouter).addLiquidity(
            tokenA,
            tokenB,
            amountADesired,
            amountBDesired,
            amountAMin,
            amountBMin,
            to,
            deadline
        );

        // Increment the swap count
        swapCount += 1;
    }

    // Function to remove liquidity
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline,
        address PAIR_ADDRESS
    ) external {
        // Approve the Uniswap router to spend the liquidity
        // require(IERC20(IUniswapV2Router(uniswapRouter).factory()).approve(uniswapRouter, liquidity), "approve liquidity failed.");
        
        IERC20(PAIR_ADDRESS).transferFrom(msg.sender, address(this), liquidity);
        // PAIR_Contract.approve(useSwap, balance);
        require(IERC20(PAIR_ADDRESS).approve(uniswapRouter, liquidity), "Transfer failed");

        // Remove liquidity using the Uniswap router
        IUniswapV2Router(uniswapRouter).removeLiquidity(
            tokenA,
            tokenB,
            liquidity,
            amountAMin,
            amountBMin,
            to,
            deadline
        );

        // Increment the swap count
        swapCount += 1;
    }

    // // Function to handle exact ETH swaps for tokens
    // function handleExactETHSwapForTokens(
    //     uint amountOut,
    //     uint amountInMax,
    //     address[] calldata path,
    //     address to,
    //     uint deadline
    // ) external payable {

    //     // Approve the Uniswap router to spend the ETH
    //     require(msg.value > 0, "ETH amount must be greater than 0.");
        
    //     // Swap ETH for tokens using the Uniswap router
    //     IUniswapV2Router(uniswapRouter).swapExactTokensForETH(
    //         amountOut,
    //         amountInMax,
    //         path,
    //         to,
    //         deadline
    //     );

    //     // Increment the swap count
    //     swapCount += 1;
    // }

    // // Function to add liquidity





   // Function to handle exact token swaps for ETH
    // function handleExactSwapForETH(
    //     uint amountIn,
    //     uint amountOutMin,
    //     address[] calldata path,
    //     address to,
    //     uint deadline
    // ) external {        

    //     // Transfer tokens from the sender to the contract
    //     IERC20(path[0]).transferFrom(msg.sender, address(this), amountIn);

    //     // Approve the Uniswap router to spend the tokens
    //     require(IERC20(path[0]).approve(uniswapRouter, amountIn), "approve failed.");
        
    //     // Swap tokens for ETH using the Uniswap router
    //     IUniswapV2Router(uniswapRouter).swapExactTokensForETH(
    //         amountIn,
    //         amountOutMin,
    //         path,
    //         to,
    //         deadline
    //     );

    //     // Increment the swap count
    //     swapCount += 1;
    // }


 
    // // Function to handle ETH swaps for tokens
    // function handleETHSwapForTokens(
    //     uint amountOutMin,
    //     address[] calldata path,
    //     address to,
    //     uint deadline
    // ) external payable {

    //     // Approve the Uniswap router to spend the ETH
    //     require(msg.value > 0, "ETH amount must be greater than 0.");
        
    //     // Swap ETH for tokens using the Uniswap router
    //     IUniswapV2Router(uniswapRouter).swapExactETHForTokens(
    //         amountOutMin,
    //         path,
    //         to,
    //         deadline
    //     );

    //     // Increment the swap count
    //     swapCount += 1;
    // }
}