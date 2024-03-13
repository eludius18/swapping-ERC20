import { run } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();
  const { deploy } = deployments;

const _router = process.env.ROUTER;
const _quoter = process.env.QUOTER;
const WETH = process.env.WETH;
const _deadline = process.env.DEADLINE;

  const swapper = await deploy("Swapper", {
    from: deployer,
    args: [],
    log: true,
    proxy: {
      proxyContract: "OpenZeppelinTransparentProxy",
      execute: {
        init: {
          methodName: "initialize",
          args: [
            _router,
            _quoter,
            WETH,
            _deadline,
          ],
        },
      },
    },
    waitConfirmations: 10,
  });

  console.log("Swapper deployed at: ", swapper.address);
  await delay(5000);
  const swapperImpl = await deployments.get("Swapper_Implementation");
  
  
  await run("verify:verify", {
    address: swapperImpl.address,
    contract: "contracts/Swapper.sol:Swapper",
  });
  
};

deploy.tags = ["Swapper"];
export default deploy;