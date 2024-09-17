import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-network-helpers");

// This function is the entry point of the script. It's marked as async to allow for asynchronous operations.
async function main() {

    // Define the addresses of the Uniswap V2 Router, USDC, and UNI tokens.
    const ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const UNI = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984";

    // Define the address of the token holder.
    const TOKEN_HOLDER = "0xf584F8728B874a6a5c7A8d4d387C9aae9172D621";

    // Impersonate the token holder account to perform actions on their behalf.
    await helpers.impersonateAccount(TOKEN_HOLDER);
    const impersonatedSigner = await ethers.getSigner(TOKEN_HOLDER);

    // Get the contract instances for the Uniswap V2 Router, USDC, and UNI tokens.
    const ROUTER = await ethers.getContractAt("IUniswapV2Router", ROUTER_ADDRESS, impersonatedSigner);
    const USDC_Contract = await ethers.getContractAt("IERC20", USDC, impersonatedSigner);
    const UNI_Contract = await ethers.getContractAt("IERC20", UNI, impersonatedSigner);

    // Log the wallet balances of USDC and UNI for the impersonated account.
    console.log("USDC Wallet Balance: "+ await USDC_Contract.balanceOf(TOKEN_HOLDER));
    console.log("UNI Wallet Balance: "+ await UNI_Contract.balanceOf(TOKEN_HOLDER));

    // Define the amounts for the liquidity addition.
    const amountADesired = ethers.parseUnits("1", 18); // Amount of USDC to add
    const amountBDesired = ethers.parseUnits("1", 18); // Amount of UNI to add
    const amountAMin =  ethers.parseUnits("0", 18);         // Minimum USDC to accept
    const amountBMin = ethers.parseUnits("0", 18);    // Minimum UNI to accept

    // Approve the router to spend the specified amounts of USDC and UNI.
    await USDC_Contract.approve(ROUTER, amountADesired);
    await UNI_Contract.approve(ROUTER, amountBDesired);

    // Set the deadline for the transaction (5 minutes from now).
    const deadline = Math.floor(Date.now() / 1000) + 300;

    // Log the start of the liquidity addition process.
    console.log("Adding Liquidity...");
    
    // Execute the addLiquidity function on the router contract.
    await ROUTER.addLiquidity(
        USDC,
        UNI,
        amountADesired,
        amountBDesired,
        amountAMin,
        amountBMin,
        TOKEN_HOLDER,
        deadline
    );

    // Log the successful addition of liquidity.
    console.log("Liquididty Added Successfully. 🤞");

}
// This pattern is recommended to handle errors and ensure the script exits properly.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});