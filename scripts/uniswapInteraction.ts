import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-network-helpers");

// This function is the entry point of the script. It's marked as async to allow for asynchronous operations.
async function main() {
    // Define the addresses of the Uniswap V2 Router, USDC, and DAI tokens.
    const ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // 6 decimals
    const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F"; // 18 decimals

    // Define the address of the token holder.
    const TOKEN_HOLDER = "0xf584F8728B874a6a5c7A8d4d387C9aae9172D621";

    // Impersonate the token holder account to perform actions on their behalf.
    await helpers.impersonateAccount(TOKEN_HOLDER);
    const impersonatedSigner = await ethers.getSigner(TOKEN_HOLDER);

    // Define swap amounts
    const amountOut = ethers.parseUnits("20", 18); // DAI (18 decimals)
    const amountInMax = ethers.parseUnits("1000", 6); // USDC (6 decimals)

    // Get contract instances
    const USDC_Contract = await ethers.getContractAt("IERC20", USDC, impersonatedSigner);
    const DAI_Contract = await ethers.getContractAt("IERC20", DAI);
    const ROUTER = await ethers.getContractAt("IUniswapV2Router", ROUTER_ADDRESS, impersonatedSigner);

    // Check USDC balance before approval
    console.log("USDC balance before approve", await USDC_Contract.balanceOf(impersonatedSigner.address));

    // Approve the router to spend USDC tokens
    await USDC_Contract.approve(ROUTER_ADDRESS, amountOut);

    // Fetch balances before the swap
    const usdcBal = await USDC_Contract.balanceOf(impersonatedSigner.address);
    const daiBal = await DAI_Contract.balanceOf(impersonatedSigner.address);
    const deadline = Math.floor(Date.now() / 1000) + (60 * 10); // 10 minutes from now

    console.log("usdc balance before swap", Number(usdcBal));
    console.log("dai balance before swap", Number(daiBal));

    // Perform the swap
    await ROUTER.swapTokensForExactTokens(
        amountOut, 
        amountInMax, 
        [USDC, DAI], 
        impersonatedSigner.address, 
        deadline
    );

    // Fetch balances after the swap
    const usdcBalAfter = await USDC_Contract.balanceOf(impersonatedSigner.address);
    const daiBalAfter = await DAI_Contract.balanceOf(impersonatedSigner.address);

    console.log("=========================================================");
    console.log("usdc balance after swap", Number(usdcBalAfter));
    console.log("dai balance after swap", Number(daiBalAfter));
    console.log("==========================================================");
}

// Run the script
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
