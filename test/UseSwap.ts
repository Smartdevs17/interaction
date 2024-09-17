import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-network-helpers");

describe("UseSwap", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployUseSwap() {
    const [owner] = await hre.ethers.getSigners();
    const ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

    const UseSwap = await hre.ethers.getContractFactory("UseSwap");
    const useSwap = await UseSwap.deploy(ROUTER_ADDRESS);

    return { useSwap, owner, ROUTER_ADDRESS };
  }

  describe("Deployment", function () {
    it("Should set the right router address", async function () {
      const { useSwap, ROUTER_ADDRESS } = await loadFixture(deployUseSwap);
      
      expect(await useSwap.uniswapRouter()).to.equal(ROUTER_ADDRESS);
    });
  });

  describe("Token Swaps", function () {
    it("Should handle token swap correctly", async function () {
      const { useSwap, } = await loadFixture(deployUseSwap);

      const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
      const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
      const TOKEN_HOLDER = "0xf584F8728B874a6a5c7A8d4d387C9aae9172D621";

      await helpers.impersonateAccount(TOKEN_HOLDER);
      const impersonatedSigner = await ethers.getSigner(TOKEN_HOLDER);

      const amountOut = ethers.parseUnits("20", 18);
      const amountInMax = ethers.parseUnits("1000", 6);

      const USDC_Contract = await ethers.getContractAt("IERC20", USDC, impersonatedSigner);
      const DAI_Contract = await ethers.getContractAt("IERC20", DAI);
      const deadline = Math.floor(Date.now() / 1000) + (60 * 10);

      await USDC_Contract.approve(useSwap, amountInMax);

      const tx = await useSwap.connect(impersonatedSigner).handleSwap(amountOut, amountInMax, [USDC, DAI], impersonatedSigner.address, deadline);

      await tx.wait();
      // console.log("🚀 Transaction mined:", tx);

      expect(await useSwap.swapCount()).to.equal(1);
    });
  });

  describe("ETH Swaps", function () {
    it("Should handle ETH swap for tokens correctly", async function () {
      const { useSwap } = await loadFixture(deployUseSwap);
    
      const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // WETH address on Ethereum mainnet
      const DAI = "0xFbE6F37d3db3fc939F665cfe21238c11a5447831";

     
      const TOKEN_HOLDER = "0xf584F8728B874a6a5c7A8d4d387C9aae9172D621";
    
      await helpers.impersonateAccount(TOKEN_HOLDER);
      const impersonatedSigner = await ethers.getSigner(TOKEN_HOLDER);

      const WETH_Contract = await ethers.getContractAt("IERC20", WETH, impersonatedSigner);

      
      const amountOutMin = ethers.parseUnits("0.001", 18);
      const deadline = Math.floor(Date.now() / 1000) + (60 * 10);
    
      const path = [WETH, DAI];

      await WETH_Contract.approve(useSwap, ethers.parseEther("2") );

      const tx = await useSwap.handleETHSwapForTokens(
        amountOutMin,
        path,
        impersonatedSigner.address,
        deadline,
        { value: ethers.parseEther("0.1") }  
      );
    
      await tx.wait();
      
    
      expect(await useSwap.swapCount()).to.equal(1);
    });


  });

  describe("Liquidity Management", function () {
    it("Should add liquidity correctly", async function () {
      const { useSwap } = await loadFixture(deployUseSwap);

      const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
      const UNI = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984";
      const amountADesired = ethers.parseUnits("1000", 6);
      const amountBDesired = ethers.parseUnits("1", 18);
      const amountAMin = ethers.parseUnits("0", 18);
      const amountBMin = ethers.parseUnits("0", 18);
      const deadline = Math.floor(Date.now() / 1000) + (60 * 10);

      const TOKEN_HOLDER = "0xf584F8728B874a6a5c7A8d4d387C9aae9172D621";
    
      await helpers.impersonateAccount(TOKEN_HOLDER);
      const impersonatedSigner = await ethers.getSigner(TOKEN_HOLDER);

      const USDC_Contract = await ethers.getContractAt("IERC20", USDC, impersonatedSigner);
      const UNI_Contract = await ethers.getContractAt("IERC20", UNI, impersonatedSigner);

      await USDC_Contract.approve(useSwap, amountADesired);
      await UNI_Contract.approve(useSwap, amountBDesired);

      const tx = await useSwap.connect(impersonatedSigner).addLiquidity(USDC, UNI, amountADesired, amountBDesired, amountAMin, amountBMin, impersonatedSigner.address, deadline);

      tx.wait();

      expect(await useSwap.swapCount()).to.equal(1);
    });

    it("Should add liquidity with ETH correctly", async function () {
      const { useSwap } = await loadFixture(deployUseSwap);
    
      // Addresses for USDC and WETH
      const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
      
      // Liquidity parameters
      const amountTokenDesired = ethers.parseUnits("10", 6);  // 10 USDC
      const amountTokenMin = ethers.parseUnits("1", 6);       // Min 8 USDC to prevent slippage issues
      const amountETHMin = ethers.parseUnits("20", 18);      // Min 0.5 ETH to prevent slippage
      const deadline = Math.floor(Date.now() / 1000) + (60 * 10); // 10 minutes from now
    
      // Address of a USDC holder to impersonate
      const TOKEN_HOLDER = "0xf584F8728B874a6a5c7A8d4d387C9aae9172D621";
    
      // Impersonate the USDC token holder
      await helpers.impersonateAccount(TOKEN_HOLDER);
      const impersonatedSigner = await ethers.getSigner(TOKEN_HOLDER);
    
      // Get the USDC contract with the impersonated signer
      const USDC_Contract = await ethers.getContractAt("IERC20", USDC, impersonatedSigner);
    
      // Ensure the impersonated signer has enough USDC balance
      const balance = await USDC_Contract.balanceOf(impersonatedSigner.address);
      expect(balance).to.be.gte(amountTokenDesired);
    
      // Approve the `useSwap` contract to spend the USDC
      await USDC_Contract.approve(useSwap, amountTokenDesired);
    
      // Increase the ETH provided for liquidity to match the USDC better
      const tx = await useSwap.connect(impersonatedSigner).addLiquidityETH(
        USDC,
        amountTokenDesired,
        amountTokenMin,  // Reduce slippage protection for token
        amountETHMin,    // Reduce slippage protection for ETH
        impersonatedSigner.address,
        deadline,
        { value: ethers.parseEther("5") }  // Provide more ETH (adjust this based on USDC/ETH price)
      );
    
      await tx.wait();
    
      // Verify that liquidity has been added and swap count is incremented
      expect(await useSwap.swapCount()).to.equal(1);
    });
    

    it("Should remove liquidity correctly", async function () {
      const { useSwap } = await loadFixture(deployUseSwap);
      const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
      const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
      const PAIR_ADDRESS = "0xAE461cA67B15dc8dc81CE7615e0320dA1A9aB8D5";  
      const amountADesired = ethers.parseUnits("100", 6);
      const amountBDesired = ethers.parseUnits("100", 18);
      let amountAMin = ethers.parseUnits("50", 6);
      let amountBMin = ethers.parseUnits("50", 18);
      const deadline = Math.floor(Date.now() / 1000) + (60 * 10);
  
      const TOKEN_HOLDER = "0xf584F8728B874a6a5c7A8d4d387C9aae9172D621";
      
      await helpers.impersonateAccount(TOKEN_HOLDER);
      const impersonatedSigner = await ethers.getSigner(TOKEN_HOLDER);
  
      const PAIR_Contract = await ethers.getContractAt("IERC20", PAIR_ADDRESS, impersonatedSigner);
      const USDC_Contract = await ethers.getContractAt("IERC20", USDC, impersonatedSigner);
      const DAI_Contract = await ethers.getContractAt("IERC20", DAI, impersonatedSigner);
  
      await USDC_Contract.approve(useSwap, amountADesired);
      await DAI_Contract.approve(useSwap, amountBDesired);
  
      // const addLiquidityTx = await useSwap.connect(impersonatedSigner).addLiquidity(USDC, DAI, amountADesired, amountBDesired, amountAMin, amountBMin, useSwap.target, deadline);
      const addLiquidityTx = await useSwap.connect(impersonatedSigner).addLiquidity(USDC, DAI, amountADesired, amountBDesired, amountAMin, amountBMin, impersonatedSigner.address, deadline);
  
      await addLiquidityTx.wait();
  
      const balance = await PAIR_Contract.balanceOf(impersonatedSigner.address);
      // const balance = await PAIR_Contract.balanceOf(useSwap.target);
      // console.log("LP Token balance after adding liquidity", ethers.formatUnits(balance, 18));
  


      // const liquidityToRemove = balance - BigInt(10);
      const liquidityToRemove = ethers.parseUnits("0.00005", 18);
      // console.log("liquidityToRemove", ethers.formatUnits(liquidityToRemove, 18));  
      await PAIR_Contract.approve(useSwap, balance);


      if (balance < (liquidityToRemove)) {
        console.error("Insufficient LP tokens to remove liquidity");
        process.exitCode = 1;
        return;
    }

      // console.log("liquidityToRemove", ethers.formatUnits(liquidityToRemove, 18));
      // console.log("balance", ethers.formatUnits(balance, 18));

      amountAMin = ethers.parseUnits("50", 6);
      amountBMin = ethers.parseUnits("50", 18);
  
      // const removeLiquidityTx = await useSwap.connect(impersonatedSigner).removeLiquidity(USDC, DAI, liquidityToRemove, amountAMin, amountBMin, useSwap.target, deadline);
      // const removeLiquidityTx = await useSwap.connect(impersonatedSigner).removeLiquidity(USDC, DAI, liquidityToRemove, amountAMin, amountBMin, impersonatedSigner.address, deadline);
      const removeLiquidityTx = await useSwap.connect(impersonatedSigner).removeLiquidity(USDC, DAI, liquidityToRemove, amountAMin, amountBMin, impersonatedSigner.address, deadline, PAIR_ADDRESS);
  
      await removeLiquidityTx.wait();
  
      expect(await useSwap.swapCount()).to.equal(2);
  });
  


  });
});
