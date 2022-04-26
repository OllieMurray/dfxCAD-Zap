const { expect } = require("chai");
const { ethers } = require("hardhat");
const FiatTokenV2ABI = require("./ABIs/FiatTokenV2.json");
const DFXABI = require("./ABIs/DFX.json");

const dfxCADABI = require("./ABIs/dfxCAD.json");
const { parseUnits } = require("ethers/lib/utils");

//no longer referenced, were used during testing
const CRVABI = require("./ABIs/Curve.json");
const staking = require("./ABIs/Staking.json");

describe("Foo", function () {
  let foo;
  let foo2;
  this.beforeAll("", async function () {
    //setup Foo contracts
    //Foo3 is final submission contracts
    //Foo and Foo2 have been left over from testing
    //
    //
    //
    //Hackathon - Ignore this
    const Foo = await ethers.getContractFactory("Foo");
    foo = await Foo.deploy();
    await foo.deployed();
    //
    //
    //
    //Hackathon - Ignore this
    const Foo2 = await ethers.getContractFactory("Foo");
    foo2 = await Foo2.deploy();
    await foo2.deployed();
    //
    //
    //
    //Hackathon -- THIS THIS THIS
    const Foo3 = await ethers.getContractFactory("Foo3");
    foo3 = await Foo3.deploy();
    await foo3.deployed();
  });

  it("Test Zap Into Stake Contract", async function () {
    //The script here tests multiple aspects of the process
    //evaluations of the tests are commented on in the accompanying spreadsheet in the main gitHub Repo
    //Set up the users account
    const { provider, utils } = ethers;
    const user = await provider.getSigner(0);
    const userAddress = await user.getAddress();
    //
    //
    //
    //CADC Contract Set Up
    const ownerAddressCADC = "0x3e30d340c83d068d632e11b5a30507ce973d7700"; // updated
    await provider.send("hardhat_impersonateAccount", [ownerAddressCADC]);
    const ownerCADC = await ethers.getSigner(ownerAddressCADC);
    const cadcAddress = "0xcaDC0acd4B445166f12d2C07EAc6E2544FbE2Eef"; // CADC
    const cadc = new ethers.Contract(cadcAddress, FiatTokenV2ABI, ownerCADC);
    //Mint an abundance of CADC to user account
    //Fee Internet Money!>!>!>!
    await cadc.updateMasterMinter(userAddress);
    const amountCADCstart = ethers.utils.parseUnits("100000", 18);
    await cadc.connect(user).configureMinter(userAddress, amountCADCstart);
    await cadc.connect(user).mint(userAddress, amountCADCstart);
    //Check Starting Balance CADC user account
    console.log(
      "Initial Balance CADC User Account (units 1e18)  " +
        (await cadc.connect(user).balanceOf(userAddress))
    );
    //
    //
    //
    //DFX Contract Set Up
    const ownerAddressDFX = "0x27E843260c71443b4CC8cB6bF226C3f77b9695AF"; // updated
    await provider.send("hardhat_impersonateAccount", [ownerAddressDFX]);
    const ownerDFX = await ethers.getSigner(ownerAddressDFX);
    const DFXAddress = "0x888888435FDe8e7d4c54cAb67f206e4199454c60"; // DFX
    const DFX = new ethers.Contract(DFXAddress, DFXABI, ownerDFX);
    //Mint an abundance of CADC to user account
    //Fee Internet Money!>!>!>!
    const amountDFX = ethers.utils.parseUnits("100000", 18);
    await DFX.connect(ownerDFX).approve(userAddress, amountDFX);
    await DFX.connect(ownerDFX).mint(userAddress, amountDFX);
    //Check Starting Balance DFX user account
    console.log(
      "Initial Balance DFX User Account (units 1e18)  " +
        (await DFX.connect(user).balanceOf(userAddress))
    );
    //
    //
    //
    //dfxCAD Contract Set Up
    const dfxCADAddress = "0xFE32747d0251BA92bcb80b6D16C8257eCF25AB1C";
    const dfxCAD = new ethers.Contract(dfxCADAddress, dfxCADABI);
    //
    //
    //
    //foo3 (Aka Zapper) return foo3 address
    foo3Address = foo3.returnAddress();
    //
    //
    //
    //User approve: transfer of balance in CADC to foo3 (Aka Zapper)
    await cadc.connect(user).approve(foo3.address, amountCADCstart);
    await cadc.connect(user).allowance(userAddress, foo3.address);
    //
    //
    //
    //User approve: transfer of balance in DFX to foo3 (Aka Zapper)
    await DFX.connect(user).approve(foo3.address, amountDFX);
    await DFX.connect(user).allowance(userAddress, foo3.address);
    //
    //
    //
    //foo3 (Aka Zapper) CADC Balance prior to Zap
    console.log(
      "foo3 (Aka Zapper) balance CADC before Zap (units 1e18)   " +
        (await cadc.connect(user).balanceOf(foo3Address))
    );
    //
    //
    //
    //
    //foo3 (Aka Zapper) DFX Balance prior to Zap
    console.log(
      "foo3 (Aka Zapper) balance DFX before Zap (units 1e18)   " +
        (await DFX.connect(user).balanceOf(foo3Address))
    );
    //
    //
    //
    //foo3 (Aka Zapper) dfxCAD Balance prior to Zap
    console.log(
      "foo3 (Aka Zapper) balance dfxCAD before Zap (units 1e18)   " +
        (await dfxCAD.connect(user).balanceOf(foo3Address))
    );
    //
    //
    //
    //Set Stake Amount
    const stakeAmount = utils.parseUnits("1000", 18);
    //foo3 (Aka Zapper) - "stakeOnCurve" - Aka the "Zap Function" - see README for details
    await foo3.connect(user).stakeOnCurve(stakeAmount);
    console.log("USER REQUESTED STAKE AMOUNT (units 1e18)   " + stakeAmount);
    //
    //
    //
    //Verify Staked Amount on dfxCAD staking contract after "Zap Function"
    const balance2 = await foo3.connect(user).balanceAt();
    console.log("USER STAKED BALANCE AFTER ZAP (units 1e18)   " + balance2);
    //
    //
    //
    //Calculate Error in ZAP - Difference Staked Balance vs Staked Call
    const diffZap = stakeAmount - balance2;
    console.log(
      "Zap Error (see Spreadsheet for Summary) (units 1e18)   " + diffZap
    );
    //
    //
    //
    //Investigations - Check Balances in User Account After Zap
    //User Account
    console.log(
      "Final Balance CADC User Account (units 1e18)   " +
        (await cadc.connect(user).balanceOf(userAddress))
    );
    //
    console.log(
      "Final Balance DFX User Account (units 1e18)  " +
        (await DFX.connect(user).balanceOf(userAddress))
    );
    //
    console.log(
      "Final Balance dfxCAD User Account (units 1e18)  " +
        (await dfxCAD.connect(user).balanceOf(userAddress))
    );
    //
    //
    //
    //foo3 (Aka Zapper) Account
    console.log(
      "foo3 (Aka Zapper) balance CADC After Zap (units 1e18)   " +
        (await cadc.connect(user).balanceOf(foo3Address))
    );
    //
    console.log(
      "foo3 (Aka Zapper) balance DFX After Zap (units 1e18)   " +
        (await DFX.connect(user).balanceOf(foo3Address))
    );
    //
    console.log(
      "foo3 (Aka Zapper) balance dfxCAD After Zap (units 1e18)   " +
        (await dfxCAD.connect(user).balanceOf(foo3Address))
    );
    //
    //
    //
    //Grab Burn Fee for Spreadsheet
    console.log(
      "dfxCAD mintBurnFee " + (await dfxCAD.connect(user).mintBurnFee())
    );
    //Grab Underlyings for request minted dfxCAD i.e. request stake amount/2 + mintBurnFee
    //or (1000/2)*(1+mintBurnFee) = 5025
    const [CADCa, DFXa] = await dfxCAD
      .connect(user)
      .getUnderlyings(parseUnits("5025", 17));
    console.log("CADC amount " + CADCa + "  DFX Amount " + DFXa);
    //
    //
    //
    //
    //
    //
    //
    //
    //Seperate From Zap - Possible Clarification on Usage In Documentation
    const [CADCa2, DFXa2] = await dfxCAD
      .connect(user)
      .getUnderlyings(parseUnits("1000", 18));
    console.log(
      "Seperate from Zap Test: CADC amount for minting 1000 dfxCAD " +
        CADCa2 +
        "  DFX Amount for minting 1000 dfxCAD " +
        DFXa2
    );
    //Approve transfer of CADC and DFX from user to dfxCAD to allow mint
    await cadc
      .connect(user)
      .approve(dfxCADAddress, ethers.constants.MaxUint256);
    await DFX.connect(user).approve(dfxCADAddress, ethers.constants.MaxUint256);
    //Mint 1000 dfxCAD
    await dfxCAD.connect(user).mint(parseUnits("1000", 18));
    //Return Balance dfxCAD
    console.log(
      "Seperate from Zap Test: mint 1000 dfxCAD  " +
        (await dfxCAD.connect(user).balanceOf(userAddress))
    );
  });
});
