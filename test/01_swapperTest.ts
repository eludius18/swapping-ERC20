import { deployments, ethers } from 'hardhat';
import { Signer } from 'ethers';
import { Swapper } from '../typechain-types/contracts';
import { TokenERC20 } from '../typechain-types/contracts';
import { Deployment } from 'hardhat-deploy/dist/types';
import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';

use(chaiAsPromised);

describe('Swapper Test', function () {
  let accounts: Signer[];
  let swapperDeployment: Deployment;
  let swapperContract: Swapper;
  let tokenDeployment: Deployment;
  let tokenContract: TokenERC20;
  let owner: Signer;
  let alice: Signer;
  const WETHAddress = process.env.WETH;
  const tokenAddress = process.env.TOKENERC20;

  before(async function () {
    accounts = await ethers.getSigners();
    owner = accounts[0];
    alice = accounts[1];
    const WETHAddress = process.env.WETH;
    const tokenAddress = process.env.TOKENERC20;
    swapperDeployment = await deployments.get('Swapper');
    swapperContract = await ethers.getContractAt(
      'Swapper',
      swapperDeployment.address
    );
    tokenDeployment = await deployments.get('TokenERC20');
    tokenContract = await ethers.getContractAt(
      'TokenERC20',
      tokenDeployment.address
    );
  });

  describe('Initialization checks', function () {
    it('should be initialized with correct WETH address', async function () {
      const weth = await swapperContract.WETH();
      expect(weth).to.equal(WETHAddress);
    });
    it('should allow changing deadline', async function () {
      const block = await ethers.provider.getBlock('latest');
      if (block === null) {
        throw new Error('Failed to fetch latest block');
      }
      const newDeadline = BigInt(block.timestamp + 3600);
      await swapperContract.connect(owner).changeDeadline(newDeadline);
      const deadline = await swapperContract.deadline();
      expect(deadline).to.equal(newDeadline);
    });
  });

  describe('swapEtherToToken function checks', function () {
    it('should revert with invalid token address (0x0)', async function () {
      const invalidAddress = '0x0000000000000000000000000000000000000000';
      await expect(swapperContract.swapEtherToToken(invalidAddress, 10)).to.be.rejectedWith('Invalid token address');    
    });
    /* it('should revert with minimum amount out of 0', async function () {
      const tokenAddress = "0xcde9198Df9C751F7eE421549C3a4E37e5A6013C3";
      await expect(swapperContract.swapEtherToToken(tokenAddress, 0)).to.be.rejectedWith('Estimated amount out is less than the minimum amount out');
    }); */
    it('should perform swap with valid parameters and return amountOut', async function () {
      const value = ethers.parseEther('0.1'); // Send 0.1 ETH
      const tokenAddress = "0x779877A7B0D9E8603169DdbD7836e478b4624789";
      const initialBalance = await tokenContract.balanceOf(await alice.getAddress());
      await swapperContract.connect(alice).swapEtherToToken(tokenAddress, 100, { value });
      const finalBalance = await tokenContract.balanceOf(await alice.getAddress());
      const totalBalance = initialBalance + BigInt(100);
      expect(finalBalance).to.equal(totalBalance);
    });
  });
});