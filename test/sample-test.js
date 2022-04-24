const { expect } = require("chai");
const { ethers } = require("hardhat");
const FiatTokenV2ABI = require("./ABIs/FiatTokenV2.json");
const DFXABI = require("./ABIs/DFX.json");

const dfxCADABI = require("./ABIs/dfxCAD.json");
const CRVABI = require("./ABIs/Curve.json");
const staking = require("./ABIs/Staking.json");
const { parseUnits } = require("ethers/lib/utils");

describe("Foo", function () {
  let foo;
  let foo2;
  this.beforeAll("", async function () {
    // setup Foo contract
    const Foo = await ethers.getContractFactory("Foo");
    foo = await Foo.deploy();
    await foo.deployed();

    const Foo2 = await ethers.getContractFactory("Foo");
    foo2 = await Foo2.deploy();
    await foo2.deployed();

    const Foo3 = await ethers.getContractFactory("Foo3");
    foo3 = await Foo3.deploy();
    await foo3.deployed();
  });

  it("Can get WETH address from UniswapV2 Router", async function () {
    expect(await foo.getWETHAddress()).to.equal(
      "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
    );
  });

  it("clean Foo3 Can swap USDC -> ETH", async function () {
    //User Account
    const { provider, utils } = ethers;
    const user = await provider.getSigner(0);
    const userAddress = await user.getAddress();
    //
    //
    //
    //CADC Account
    const ownerAddressCADC = "0x3e30d340c83d068d632e11b5a30507ce973d7700"; // updated
    await provider.send("hardhat_impersonateAccount", [ownerAddressCADC]);
    const ownerCADC = await ethers.getSigner(ownerAddressCADC);
    const cadcAddress = "0xcaDC0acd4B445166f12d2C07EAc6E2544FbE2Eef"; // CADC
    const cadc = new ethers.Contract(cadcAddress, FiatTokenV2ABI, ownerCADC);
    // make ourselves the master minter and mint ourselves some CADC
    await cadc.updateMasterMinter(userAddress);
    const amountCADCstart = ethers.utils.parseUnits("100000", 18);
    await cadc.connect(user).configureMinter(userAddress, amountCADCstart);
    await cadc.connect(user).mint(userAddress, amountCADCstart);
    console.log(
      "test foo3 balance of CADC in user account  " +
        (await cadc.connect(user).balanceOf(userAddress))
    );
    //
    //
    //
    //DFX Account
    const ownerAddressDFX = "0x27E843260c71443b4CC8cB6bF226C3f77b9695AF"; // updated
    await provider.send("hardhat_impersonateAccount", [ownerAddressDFX]);
    const ownerDFX = await ethers.getSigner(ownerAddressDFX);
    const DFXAddress = "0x888888435FDe8e7d4c54cAb67f206e4199454c60"; // DFX
    const DFX = new ethers.Contract(DFXAddress, DFXABI, ownerDFX);
    //mint some DFX
    const amountDFX = ethers.utils.parseUnits("100000", 18);
    await DFX.connect(ownerDFX).approve(userAddress, amountDFX);
    await DFX.connect(ownerDFX).mint(userAddress, amountDFX);
    //
    //
    //
    //dfxCAD Account
    const dfxCADAddress = "0xFE32747d0251BA92bcb80b6D16C8257eCF25AB1C"; // DFX
    const dfxCAD = new ethers.Contract(dfxCADAddress, dfxCADABI);
    //
    //
    //foo3 Address
    foo3Address = foo3.returnAddress();
    //
    //
    //
    //User approve foo3 address for CADC transfers
    await cadc.connect(user).approve(foo3.address, amountCADCstart);
    await cadc.connect(user).allowance(userAddress, foo3.address);
    //
    //
    //
    //User approve foo3 address for DFX transfers
    await DFX.connect(user).approve(foo3.address, amountDFX);
    await DFX.connect(user).allowance(userAddress, foo3.address);
    //
    //
    //
    //Prior balance checking
    //User CADC balance prior to stake
    console.log(
      "CADC user balance prior to transfer  " +
        (await cadc.connect(user).balanceOf(userAddress))
    );
    //User DFX balance prior to stake
    console.log(
      "DFX user balance prior to transfer  " +
        (await DFX.connect(user).balanceOf(userAddress))
    );
    //foo3 dfxCAD prior to stake
    console.log(
      "foo3 initial balance dfxCAD  " +
        (await dfxCAD.connect(user).balanceOf(foo3Address))
    );
    //foo3 balance cadc
    console.log(
      "foo3 initial balance cadc  " +
        (await cadc.connect(user).balanceOf(foo3Address))
    );
    //
    //
    //
    //Call Foo3 to stake amount
    const stakeAmount = utils.parseUnits("1000", 18);
    //call Zap
    await foo3.connect(user).stakeOnCurve(stakeAmount);
    //
    //
    //
    //check the balances after transfer to zap...
    console.log(
      "CADC user balance after transfer to zap  " +
        (await cadc.connect(user).balanceOf(userAddress))
    );
    //
    console.log(
      "DFX user balance after transfer to zap  " +
        (await DFX.connect(user).balanceOf(userAddress))
    );
    //
    console.log(
      "foo3 final balance dfxCAD  " +
        (await dfxCAD.connect(user).balanceOf(foo3Address))
    );
    //
    console.log(
      "foo3 final balance cadc  " +
        (await cadc.connect(user).balanceOf(foo3Address))
    );
    //diff dfx
    console.log("diff DFX " + (await foo3.connect(user).diffDFX()));
    //diffcadc
    console.log("diff CADC " + (await foo3.connect(user).diffCADC()));
    //tracker
    console.log("tracker " + (await foo3.connect(user).tracker()));
    //
    console.log(
      "amount to stake " + (await foo3.connect(user).stakeAmountCADCGlobal())
    );
    //dfxCADMintRequiredGlobal
    console.log(
      "amount to of dfxCAD to Mint " +
        (await foo3.connect(user).dfxCADMintRequiredGlobal())
    );
    //
    //
    //
    //Check staked balance
    const balance2 = await foo3.connect(user).balanceAt();
    const balance3 = balance2;

    console.log(
      "test foo3 balance staked after calling foo3 combined call " + balance3
    );
  });

  it("Debug Support Test for Foo3 Can swap USDC -> ETH", async function () {
    //User Account
    const { provider, utils } = ethers;
    const user = await provider.getSigner(0);
    const userAddress = await user.getAddress();
    //
    //
    //
    //CADC Account
    const ownerAddressCADC = "0x3e30d340c83d068d632e11b5a30507ce973d7700"; // updated
    await provider.send("hardhat_impersonateAccount", [ownerAddressCADC]);
    const ownerCADC = await ethers.getSigner(ownerAddressCADC);
    const cadcAddress = "0xcaDC0acd4B445166f12d2C07EAc6E2544FbE2Eef"; // CADC
    const cadc = new ethers.Contract(cadcAddress, FiatTokenV2ABI, ownerCADC);
    // make ourselves the master minter and mint ourselves some CADC
    await cadc.updateMasterMinter(userAddress);
    const amountCADCstart = ethers.utils.parseUnits("100000", 18);
    await cadc.connect(user).configureMinter(userAddress, amountCADCstart);
    await cadc.connect(user).mint(userAddress, amountCADCstart);
    console.log(
      "test foo3 balance of CADC in user account  " +
        (await cadc.connect(user).balanceOf(userAddress))
    );
    //
    //
    //
    //DFX Account
    const ownerAddressDFX = "0x27E843260c71443b4CC8cB6bF226C3f77b9695AF"; // updated
    await provider.send("hardhat_impersonateAccount", [ownerAddressDFX]);
    const ownerDFX = await ethers.getSigner(ownerAddressDFX);
    const DFXAddress = "0x888888435FDe8e7d4c54cAb67f206e4199454c60"; // DFX
    const DFX = new ethers.Contract(DFXAddress, DFXABI, ownerDFX);
    //mint some DFX
    const amountDFX = ethers.utils.parseUnits("100000", 18);
    await DFX.connect(ownerDFX).approve(userAddress, amountDFX);
    await DFX.connect(ownerDFX).mint(userAddress, amountDFX);
    //
    //
    //
    //dfxCAD Account
    const dfxCADAddress = "0xFE32747d0251BA92bcb80b6D16C8257eCF25AB1C"; // DFX
    const dfxCAD = new ethers.Contract(dfxCADAddress, dfxCADABI);
    //
    //
    //foo3 Address
    foo3Address = foo3.returnAddress();
    //
    //
    //
    //User approve foo3 address for CADC transfers
    await cadc.connect(user).approve(foo3.address, amountCADCstart);
    await cadc.connect(user).allowance(userAddress, foo3.address);
    //
    //
    //
    //User approve foo3 address for DFX transfers
    await DFX.connect(user).approve(foo3.address, amountDFX);
    await DFX.connect(user).allowance(userAddress, foo3.address);
    //
    //
    //
    //Prior balance checking
    //User CADC balance prior to stake
    const userBalanceCADCPrior = await cadc
      .connect(user)
      .balanceOf(userAddress);
    console.log(
      "CADC user balance prior to mint dfxCADc  " +
        (await cadc.connect(user).balanceOf(userAddress))
    );
    //User DFX balance prior to stake
    const userBalanceDFXPrior = await DFX.connect(user).balanceOf(userAddress);
    console.log(
      "DFX user balance prior to mint dfxCADc  " +
        (await DFX.connect(user).balanceOf(userAddress))
    );
    //
    //
    //
    //approve dfxCAD
    await cadc
      .connect(user)
      .approve(dfxCADAddress, ethers.constants.MaxUint256);
    await DFX.connect(user).approve(dfxCADAddress, ethers.constants.MaxUint256);
    //const amountdfxCADC = ethers.utils.parseUnits("500", 18);
    //mind dfxCAD
    await dfxCAD.connect(user).mint(parseUnits("1000", 18));
    //
    //
    //
    //show the minted balance of dfxCAD
    console.log(
      "test mint dfxCAD  " + (await dfxCAD.connect(user).balanceOf(userAddress))
    );

    //
    //
    //
    //check the balances after transfer to zap...
    const userBalanceCADCAfter = await cadc
      .connect(user)
      .balanceOf(userAddress);
    console.log(
      "CADC user balance after transfer to zap  " +
        (await cadc.connect(user).balanceOf(userAddress))
    );
    //
    const userBalanceDFXAfter = await DFX.connect(user).balanceOf(userAddress);
    console.log(
      "DFX user balance after transfer to zap  " +
        (await DFX.connect(user).balanceOf(userAddress))
    );
    //
    const diffCADC = userBalanceCADCPrior - userBalanceCADCAfter;
    const dffDFX = userBalanceDFXPrior - userBalanceDFXAfter;
    console.log("Diff CADC after  " + diffCADC);
    //
    console.log("diff DFX After  " + dffDFX);
    //
    //
    //
    //return the balance of DFX CAD
    console.log(
      "balance dfxCAD  " + (await dfxCAD.connect(user).balanceOf(userAddress))
    );
  });

  it("Can mint ourselves 1000 USDC", async function () {
    const { provider } = ethers;
    const user = await provider.getSigner(0);
    const userAddress = await user.getAddress();

    // impersonate the USDC contract owner
    const ownerAddress = "0xFcb19e6a322b27c06842A71e8c725399f049AE3a";
    await provider.send("hardhat_impersonateAccount", [ownerAddress]);
    const owner = await ethers.getSigner(ownerAddress);

    // setup contract
    const usdcAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // USDC
    const usdc = new ethers.Contract(usdcAddress, FiatTokenV2ABI, owner);

    const before = await usdc.balanceOf(userAddress);
    console.log("base amount of usdc  " + before);

    // make ourselves the master minter and mint ourselves some USDC
    await usdc.updateMasterMinter(userAddress);
    const amount = ethers.utils.parseUnits("1000000000", 6);
    await usdc.connect(user).configureMinter(userAddress, amount);
    await usdc.connect(user).mint(userAddress, amount);

    // assertions
    const after = await usdc.balanceOf(userAddress);
    console.log("amount of usdc after mint  " + after);
    expect(after.sub(before)).to.equal(amount);
  });

  it("Can mint ourselves 1000 CADC", async function () {
    const { provider } = ethers;
    const user = await provider.getSigner(0);
    const userAddress = await user.getAddress();

    //test for CADC -- CAD mint is working now...
    // impersonate the USDC contract owner
    const ownerAddressCADC = "0x3e30d340c83d068d632e11b5a30507ce973d7700"; // updated
    await provider.send("hardhat_impersonateAccount", [ownerAddressCADC]);
    const ownerCADC = await ethers.getSigner(ownerAddressCADC);

    // setup contract
    const cadcAddress = "0xcaDC0acd4B445166f12d2C07EAc6E2544FbE2Eef"; // CADC
    const cadc = new ethers.Contract(cadcAddress, FiatTokenV2ABI, ownerCADC);

    const beforeCADC = await cadc.balanceOf(userAddress);

    // make ourselves the master minter and mint ourselves some USDC
    await cadc.updateMasterMinter(userAddress);
    const amountCADC = ethers.utils.parseUnits("1000000000", 6);
    await cadc.connect(user).configureMinter(userAddress, amountCADC);
    await cadc.connect(user).mint(userAddress, amountCADC);

    // assertions
    const afterCADC = await cadc.balanceOf(userAddress);
    console.log("test mint CADC  " + afterCADC);
    expect(afterCADC.sub(beforeCADC)).to.equal(amountCADC);
  });

  it("Can mint ourselves 1000 DFX", async function () {
    const { provider } = ethers;
    const user = await provider.getSigner(0);
    const userAddress = await user.getAddress();

    //try the DFX mint next...
    // impersonate the USDC contract owner
    const ownerAddressDFX = "0x27E843260c71443b4CC8cB6bF226C3f77b9695AF"; // updated
    await provider.send("hardhat_impersonateAccount", [ownerAddressDFX]);
    const ownerDFX = await ethers.getSigner(ownerAddressDFX);

    // setup contract
    const DFXAddress = "0x888888435FDe8e7d4c54cAb67f206e4199454c60"; // DFX
    const DFX = new ethers.Contract(DFXAddress, DFXABI, ownerDFX);

    const beforeDFX = await DFX.balanceOf(userAddress);

    // make ourselves the master minter and mint ourselves some USDC

    const amountDFX = ethers.utils.parseUnits("10000000", 6);
    await DFX.connect(ownerDFX).approve(userAddress, amountDFX);
    //await DFX.connect(user).increaseAllowance(userAddress, amount);
    await DFX.connect(ownerDFX).mint(userAddress, amountDFX);

    // assertions
    const afterDFX = await DFX.balanceOf(userAddress);

    //check the amount of DFX that was minted...
    console.log("test mint DFX  " + afterDFX);

    expect(afterDFX.sub(beforeDFX)).to.equal(amountDFX);
  });

  it("Can mint ourselves 1000 dfxCAD", async function () {
    const { provider } = ethers;
    const user = await provider.getSigner(0);
    const userAddress = await user.getAddress();

    //CADC contract
    const ownerAddressCADC = "0x3e30d340c83d068d632e11b5a30507ce973d7700"; // updated
    await provider.send("hardhat_impersonateAccount", [ownerAddressCADC]);
    const ownerCADC = await ethers.getSigner(ownerAddressCADC);

    // setup contract
    const cadcAddress = "0xcaDC0acd4B445166f12d2C07EAc6E2544FbE2Eef"; // CADC
    const cadc = new ethers.Contract(cadcAddress, FiatTokenV2ABI, ownerCADC);

    //add some CADC
    await cadc.updateMasterMinter(userAddress);
    const amountCADC = ethers.utils.parseUnits("100000000", 18);
    await cadc.connect(user).configureMinter(userAddress, amountCADC);
    await cadc.connect(user).mint(userAddress, amountCADC);

    //DFX contract
    const ownerAddressDFX = "0x27E843260c71443b4CC8cB6bF226C3f77b9695AF"; // updated
    await provider.send("hardhat_impersonateAccount", [ownerAddressDFX]);
    const ownerDFX = await ethers.getSigner(ownerAddressDFX);

    // setup contract
    const DFXAddress = "0x888888435FDe8e7d4c54cAb67f206e4199454c60"; // DFX
    const DFX = new ethers.Contract(DFXAddress, DFXABI, ownerDFX);

    //add some dfx
    const amountDFX = ethers.utils.parseUnits("10000000", 18);
    await DFX.connect(ownerDFX).approve(userAddress, amountDFX);
    //await DFX.connect(user).increaseAllowance(userAddress, amount);
    await DFX.connect(ownerDFX).mint(userAddress, amountDFX);

    //for dfxCAD
    //probably don't need owner account
    //const ownerAddressdfxCAD = "0x27e843260c71443b4cc8cb6bf226c3f77b9695af"; // updated
    //await provider.send("hardhat_impersonateAccount", [ownerAddressdfxCAD]);
    //const ownerdfxCAD = await ethers.getSigner(ownerAddressdfxCAD);

    const dfxCADAddress = "0xFE32747d0251BA92bcb80b6D16C8257eCF25AB1C"; // DFX
    const dfxCAD = new ethers.Contract(dfxCADAddress, dfxCADABI);

    //const beforedfxCAD = await dfxCAD.balanceOf(userAddress);
    //console.log("beforedfxCAD:", beforedfxCAD);

    await cadc
      .connect(user)
      .approve(dfxCADAddress, ethers.constants.MaxUint256);
    await DFX.connect(user).approve(dfxCADAddress, ethers.constants.MaxUint256);

    const amountdfxCADC = ethers.utils.parseUnits("500", 18);
    await dfxCAD.connect(user).mint(parseUnits("1000000", 18));
    // console.log(
    //   "balance of dfxCADC:  " +
    //     (await dfxCAD.connect(user).balanceOf(userAddress))
    // );
    console.log(
      "test mint dfxCAD  " + (await dfxCAD.connect(user).balanceOf(userAddress))
    );

    console.log(
      "write out the mint burn fee for dfxCAD " +
        (await dfxCAD.connect(user).mintBurnFee())
    );
    //try and call the ratio function on
    const [CADCa, DFXa] = await dfxCAD
      .connect(user)
      .getUnderlyings(parseUnits("1000", 18));
    console.log(CADCa + "   " + DFXa);

    //add liquidity to the staking pool token contract...
    //const ownerAddressSTK = "0x9CA41a2DaB3CEE15308998868ca644e2e3be5C59"; // updated
    //await provider.send("hardhat_impersonateAccount", [ownerAddressSTK]);
    //const ownerSTK = await ethers.getSigner(ownerAddressSTK);

    // setup contract
    const STKTKNAddress = "0x9CA41a2DaB3CEE15308998868ca644e2e3be5C59"; // STK
    const STKTKN = new ethers.Contract(STKTKNAddress, staking);

    // console.log(
    //   "balance of stake  " + (await STKTKN.connect(user).balanceOf(userAddress))
    // );

    //approve staking pool token  contract for cadc and DFX with our user account...
    await cadc
      .connect(user)
      .approve(STKTKNAddress, ethers.constants.MaxUint256);
    await dfxCAD
      .connect(user)
      .approve(STKTKNAddress, ethers.constants.MaxUint256);
    //const values = [parseUnits("10", 18), parseUnits("10", 18)];
    //call add liquidity...
    //
    //await STKTKN.connect(user).add_liquidity(values, parseUnits("1", 18));
    console.log("test A  " + (await STKTKN.connect(user).A()));
    console.log("test symbol  " + (await STKTKN.connect(user).symbol()));

    //were we able to call balanceOf on a similar contracT?
    //I am not sure if we were able to do it...
    const CADCUSDCaddress = "0x1054Ff2ffA34c055a13DCD9E0b4c0cA5b3aecEB9"; // STK
    const CADCUSDC = new ethers.Contract(CADCUSDCaddress, staking);

    //probably need to bring in the abi to test this out... because version is not appearing...
    //console.log("Version   " + (await CADCUSDC.connect(user).version()));

    // console.log(
    //   "test symbol CADCUSDC balance address 0  " +
    //     (await CADCUSDC.connect(user).balanceOf(ethers.constants.AddressZero))
    // );

    //try calling something from here.. https://www.convexfinance.com/stake
    //error message..
    //https://docs.ethers.io/v5/troubleshooting/errors/#help-CALL_EXCEPTION

    // console.log(
    //   "test symbol  " +
    //     (await STKTKN.connect(user).balanceOf(ethers.constants.AddressZero))
    // );

    //the above functions work...
    //the problem then is in the balanceOf command....
    //what is the potential issue with this call?
    //

    //

    STKTKN.connect(user).add_liquidity(
      [
        cadc.connect(user).balanceOf(userAddress),
        DFX.connect(user).balanceOf(userAddress),
      ],
      0
    );

    //but it's weird though, I'm not sure how it works to be honest...
    //when I call the read function

    //

    console.log(
      "balance of stake  user 0 " + (await STKTKN.connect(user).balances(0))
    );

    //);

    //weird, so the issues is we cannot even call anything from this stake token address..
    //let's see what is in the stuff adrian and kyle sent out to us...
    //

    // -->
  });

  it("Can swap USDC -> ETH", async function () {
    const { provider, utils } = ethers;
    const user = await provider.getSigner(0);
    const userAddress = await user.getAddress();

    // setup contract
    const usdcAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // USDC
    const usdc = new ethers.Contract(usdcAddress, FiatTokenV2ABI, user);

    const amount = utils.parseUnits("1000", 6);

    // approval for contract to spend my USDC
    await usdc.approve(foo.address, amount);

    //do the above again but for DFX

    // record balances before swap
    //modify for CADC, modify for DFX
    const usdcBefore = await usdc.balanceOf(userAddress);
    const ethBefore = await provider.getBalance(userAddress);

    console.log(
      "in swap test, amount of usdc before swap, g.t. 0 then carried over from first test!" +
        usdcBefore
    );

    // execute swap
    //modify to
    await foo.connect(user).swapUSDCToEth(amount, ethers.constants.Zero);

    // record balances after swap
    const usdcAfter = await usdc.balanceOf(userAddress);
    console.log("in swap test, amount of USD after swap  " + usdcAfter);

    const ethAfter = await provider.getBalance(userAddress);

    // assertions
    const usdcLost = utils.formatUnits(usdcBefore.sub(usdcAfter), 6);
    const ethGained = utils.formatEther(ethAfter.sub(ethBefore));
    expect(usdcLost).to.equal("1000.0");
    expect(ethGained).to.equal("0.382814971421528175");
  });

  it("Foo3 Can swap USDC -> ETH", async function () {
    const { provider, utils } = ethers;
    const user = await provider.getSigner(0);
    const userAddress = await user.getAddress();

    const ownerAddressCADC = "0x3e30d340c83d068d632e11b5a30507ce973d7700"; // updated
    await provider.send("hardhat_impersonateAccount", [ownerAddressCADC]);
    const ownerCADC = await ethers.getSigner(ownerAddressCADC);

    // setup contract
    const cadcAddress = "0xcaDC0acd4B445166f12d2C07EAc6E2544FbE2Eef"; // CADC
    const cadc = new ethers.Contract(cadcAddress, FiatTokenV2ABI, ownerCADC);

    // make ourselves the master minter and mint ourselves some USDC
    await cadc.updateMasterMinter(userAddress);
    const amountCADCstart = ethers.utils.parseUnits("100000", 6);
    await cadc.connect(user).configureMinter(userAddress, amountCADCstart);
    await cadc.connect(user).mint(userAddress, amountCADCstart);
    console.log(
      "test foo3 balance of CADC in user account  " +
        (await cadc.connect(user).balanceOf(userAddress))
    );
    //
    //
    //
    //
    //
    //
    //
    //
    //try the DFX mint next...
    // impersonate the USDC contract owner
    const ownerAddressDFX = "0x27E843260c71443b4CC8cB6bF226C3f77b9695AF"; // updated
    await provider.send("hardhat_impersonateAccount", [ownerAddressDFX]);
    const ownerDFX = await ethers.getSigner(ownerAddressDFX);

    // setup contract
    const DFXAddress = "0x888888435FDe8e7d4c54cAb67f206e4199454c60"; // DFX
    const DFX = new ethers.Contract(DFXAddress, DFXABI, ownerDFX);

    //add some dfx
    const amountDFX = ethers.utils.parseUnits("100000", 18);
    await DFX.connect(ownerDFX).approve(userAddress, amountDFX);
    //await DFX.connect(user).increaseAllowance(userAddress, amount);
    await DFX.connect(ownerDFX).mint(userAddress, amountDFX);

    //
    //
    //
    //
    //
    //
    //
    //
    //
    //

    const dfxCADAddress = "0xFE32747d0251BA92bcb80b6D16C8257eCF25AB1C"; // DFX
    const dfxCAD = new ethers.Contract(dfxCADAddress, dfxCADABI);

    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    const amountCADC = utils.parseUnits("1000", 18);
    const amountCADC2 = utils.parseUnits("1000", 18);
    await cadc.approve(foo3.address, amountCADC);
    await cadc.connect(user).approve(foo3.address, amountCADC);
    await cadc.connect(user).allowance(userAddress, foo3.address);
    // console.log(
    //   "test foo3 transferCADCTothis  " +
    //     (await foo3.connect(user).transferCADC(amountCADC2))
    // );

    await foo3.connect(user).transferCADC(amountCADC2);

    foo3Address = foo3.returnAddress();
    //or could try foo3.getAddress() instead...

    console.log(
      "test foo3 transferCADCTothis  " +
        (await cadc.connect(user).balanceOf(foo3Address))
    );

    //ok the transfer actually worked, great!!!!
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    const amountDFX2 = utils.parseUnits("10000", 18);
    const amountDFX3 = utils.parseUnits("10000", 18);
    await DFX.approve(foo3.address, amountDFX2);
    await DFX.connect(user).approve(foo3.address, amountDFX2);
    await DFX.connect(user).allowance(userAddress, foo3.address);
    // console.log(
    //   "test foo3 transferDFXToThis  " +
    //     (await foo3.connect(user).transferDFX(amountDFX3))
    // );

    await foo3.connect(user).transferDFX(amountDFX3);

    console.log(
      "test foo3 transferDFXTothis  " +
        (await DFX.connect(user).balanceOf(foo3Address))
    );
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    await foo3.connect(user).mintDfxCAD(amountDFX3);

    console.log(
      "test foo3 balance dfxCAD  " +
        (await dfxCAD.connect(user).balanceOf(foo3Address))
    );
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    const STKTKNAddress = "0x9CA41a2DaB3CEE15308998868ca644e2e3be5C59"; // STK
    const STKTKN = new ethers.Contract(STKTKNAddress, staking);

    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //

    await foo3.connect(user).stake();
    //const amountStake = utils.parseUnits("10000", 6);
    // console.log(
    //   "test foo3 balance staked  " +
    //     (await STKTKN.connect(user).balanceOf(foo3Address))
    // );
    const balance = await foo3.connect(user).balanceAt();

    console.log("test foo3 balance staked  " + balance);

    const testDecimalMath = utils.parseUnits("500", 18);
    //const testDecimal = ;

    //check the balances in our user account for CADC and DFX...
    console.log(
      "DFX user balance prior to transfer  " +
        (await DFX.connect(user).balanceOf(userAddress))
    );

    console.log(
      "CADC user balance prior to transfer  " +
        (await cadc.connect(user).balanceOf(userAddress))
    );

    //initial foo3 balance dfxcad
    console.log(
      "foo3 initial balance dfxCAD  " +
        (await dfxCAD.connect(user).balanceOf(foo3Address))
    );
    // console.log(
    //   "CADC user balance prior to transfer  " +
    //     (await cadc.connect(foo3).balanceOf(userAddress))
    // );

    //balance is fine... approve a reasonable transfer amount to
    await cadc.connect(user).approve(foo3.address, amountCADC);
    await cadc.connect(user).allowance(userAddress, foo3.address);
    await DFX.connect(user).approve(foo3.address, amountDFX2);
    await DFX.connect(user).allowance(userAddress, foo3.address);

    console.log(
      "test decimal math " +
        (await foo3.connect(user).stakeOnCurveWorking(testDecimalMath))
    );

    //check the balances after transfer to zap...
    console.log(
      "CADC user balance after transfer to zap  " +
        (await cadc.connect(user).balanceOf(userAddress))
    );

    console.log(
      "DFX user balance after transfer to zap  " +
        (await DFX.connect(user).balanceOf(userAddress))
    );

    //foo3 balance dfxcad after mint...
    console.log(
      "foo3 final balance dfxCAD  " +
        (await dfxCAD.connect(user).balanceOf(foo3Address))
    );

    //diff dfx
    console.log("diff DFX " + (await foo3.connect(user).diffDFX()));

    //diffcadc
    console.log("diff DFX " + (await foo3.connect(user).diffCADC()));

    //tracker
    console.log("tracker " + (await foo3.connect(user).tracker()));

    console.log(
      "amount to stake " + (await foo3.connect(user).stakeAmountCADCGlobal())
    );

    const balance2 = await foo3.connect(user).balanceAt();
    const balance3 = balance2 - balance;

    console.log(
      "test foo3 balance staked after calling foo3 combined call " + balance3
    );
  });
});
