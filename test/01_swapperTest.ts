import { deployments, ethers } from 'hardhat';
import { Signer } from 'ethers';
import { Swapper } from '../typechain-types/contracts';
import { Deployment } from 'hardhat-deploy/dist/types';
import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';

use(chaiAsPromised);

describe('Swapper Test', function () {
  let accounts: Signer[];
  let swapperDeployment: Deployment;
  let swapperContract: Swapper;
  let owner: Signer;
  let alice: Signer;

  before(async function () {
    accounts = await ethers.getSigners();
    owner = accounts[0];
    alice = accounts[1];
    swapperDeployment = await deployments.get('Swapper');
    swapperContract = await ethers.getContractAt(
      'Swapper',
      swapperDeployment.address
    );

  });

  describe('Modifiers checks', function () {
    describe('Ownable', function () {
      it('should set owner on initialize', async function () {
        const ownerAddress = await swapperContract.owner();
        expect(ownerAddress).to.equal(owner.address);
      });
    
      it('should only allow owner to change deadline', async function () {
        const isPaused = await swapperContract.paused();
        if (isPaused) {
          await swapperContract.connect(owner).unpause();
        }
        const newDeadline = 5000n;
        await expect(swapperContract.connect(alice).changeDeadline(newDeadline)).to.be.rejected;
        await swapperContract.connect(owner).changeDeadline(newDeadline);
        expect(await swapperContract.deadline()).to.equal(newDeadline);
      });
    });
    describe('Pausable', function () {
      it('should not allow non-owners to pause', async function () {
        await expect(swapperContract.connect(alice).pause()).to.be.rejected;
      });
    
      it('should not allow swaps when paused', async function () {
        const tokenAddress = process.env.TOKENERC20;
        const isPaused = await swapperContract.paused();
        if (!isPaused) {
          await swapperContract.connect(owner).pause();
        }
        await expect(swapperContract.connect(owner).swapEtherToToken(tokenAddress, 1)).to.be.rejected;
      });
    
      it('should allow swaps when unpaused', async function () {
        const value = ethers.parseEther('0.1');
        const tokenAddress = process.env.TOKENERC20;
        const isPaused = await swapperContract.paused();
        if (isPaused) {
          await swapperContract.connect(owner).unpause();
        }
        await expect(swapperContract.connect(owner).swapEtherToToken(tokenAddress, 1, { value })).to.not.be.rejected;
      });
    });
  });

  describe('Core Functionalities', function () {
    describe('Deadline', function () {
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
    describe('Swap Ether To Token', function () {
      it('should revert with invalid token address (0x0)', async function () {
        const invalidAddress = '0x0000000000000000000000000000000000000000';
        await expect(swapperContract.swapEtherToToken(invalidAddress, 10)).to.be.rejected;    
      });
      it('should perform swap with valid parameters and return amountOut', async function () {
        const value = ethers.parseEther('0.1');
        const tokenAddress = process.env.TOKENERC20;
        await swapperContract.connect(owner).swapEtherToToken(tokenAddress, 1, { value });
      });
    });
  });
});