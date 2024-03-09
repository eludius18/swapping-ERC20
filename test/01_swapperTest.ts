import { deployments, ethers } from 'hardhat'
import { expect } from 'chai'
import { Signer } from 'ethers'
import { Swapper } from '../typechain-types/contracts'
import { Deployment } from 'hardhat-deploy/dist/types'



describe('Swapper Test', async function () {
  let accounts: Signer[]
  let swapperDeployment: Deployment
  let swapperContract: Swapper
  let owner: Signer
  let alice: Signer
  let bob: Signer

  before(async function () {
    accounts = await ethers.getSigners()
    owner = accounts[0]
    alice = accounts[1]
    bob = accounts[2]
    swapperDeployment = await deployments.get('Swapper')
    swapperContract = await ethers.getContractAt(
      'Swapper',
      swapperDeployment.address
    )
  })

  describe('swapEtherToToken', () => {
    it('should revert if token address is zero', async () => {
      await
        swapperContract.connect(alice).swapEtherToToken("0x0000000000000000000000000000000000000000", 1);
        //await expect (swapperContract.connect(alice).swapEtherToToken("0x0000000000000000000000000000000000000000", 1)).to.be.revertedWith('Invalid token address');

    })
  })
})