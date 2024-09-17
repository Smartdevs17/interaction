import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-network-helpers");

async function main() {
    const ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const TOKEN_HOLDER = "0xf584F8728B874a6a5c7A8d4d387C9aae9172D621";

    await helpers.impersonateAccount(TOKEN_HOLDER);
    const impersonatedSigner = await ethers.getSigner(TOKEN_HOLDER);

    const USDC_Contract = await ethers.getContractAt("IERC20", USDC, impersonatedSigner);
    const ROUTER = await ethers.getContractAt("IUniswapV2Router", ROUTER_ADDRESS, impersonatedSigner);

    const amountTokenDesired = ethers.parseUnits("100", 6);
    const amountTokenMin = ethers.parseUnits("99", 6);
    const amountETHMin = ethers.parseUnits("0", 18);
    const ETHAmount = ethers.parseUnits("20", 18);
    const to = impersonatedSigner.address;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 10; 
    
    console.log("🚀 Starting to add liquidity for ETH... 🚀");
    console.log("🔄 Approving USDC for the router... 🔄");
    await USDC_Contract.approve(ROUTER_ADDRESS, amountTokenDesired);
    console.log("✅ Approved USDC for the router. ✅");

    console.log("🔄 Fetching USDC balance before adding liquidity... 🔄");
    const usdcBefore = await USDC_Contract.balanceOf(impersonatedSigner.address);
    console.log(`🚨 USDC balance before adding liquidity: ${usdcBefore.toString()}. 🚨`);

    const tx = await ROUTER.addLiquidityETH(
        USDC,
        amountTokenDesired,
        amountTokenMin,
        amountETHMin,
        to,
        deadline,
        {
          value: ETHAmount,
        });
    
    console.log("🔄 Waiting for the transaction to be mined... 🔄");
    await tx.wait();
    console.log("🔄 TX: ", tx);
    console.log("✅ Transaction mined! ✅");

    console.log("🔄 Fetching USDC balance after adding liquidity... 🔄");
    const usdcAfter = await USDC_Contract.balanceOf(impersonatedSigner.address);
    console.log(`🚨 USDC balance after adding liquidity: ${usdcAfter.toString()}. 🚨`);

    console.log(`🚀 Add Liquidity ETH Transaction: ${tx.hash}. 🚀`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});