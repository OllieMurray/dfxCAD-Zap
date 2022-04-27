const { expect } = require("chai");
const { ethers } = require("hardhat");
const FiatTokenV2ABI = require("./ABIs/FiatTokenV2.json");
const DFXABI = require("./ABIs/DFX.json");

const dfxCADABI = require("./ABIs/dfxCAD.json");
const { parseUnits } = require("ethers/lib/utils");

//no longer referenced, were used during testing
const CRVABI = require("./ABIs/Curve.json");
const staking = require("./ABIs/Staking.json");

describe("Zapper", function () {
  this.beforeAll("", async function () {
    //
    //
    //
    //Hackathon -- THIS THIS THIS
    const Zapper = await ethers.getContractFactory("Zapper");
    zapper = await Zapper.deploy();
    await zapper.deployed();
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
    //Free Internet Money!>!>!>!
    const amountDFX = ethers.utils.parseUnits("100000", 18);
    await DFX.connect(ownerDFX).approve(userAddress, amountDFX);
    await DFX.connect(ownerDFX).mint(userAddress, amountDFX);
    //
    //
    //
    //dfxCAD Contract Set Up
    const dfxCADAddress = "0xFE32747d0251BA92bcb80b6D16C8257eCF25AB1C";
    //
    //
    //
    //Zapper return Zapper address
    zapperAddress = zapper.returnAddress();
    //
    //
    //
    //User approve: transfer of balance in CADC to Zapper
    await cadc.connect(user).approve(zapper.address, amountCADCstart);
    await cadc.connect(user).allowance(userAddress, zapper.address);
    //
    //
    //
    //User approve: transfer of balance in DFX to Zapper
    await DFX.connect(user).approve(zapper.address, amountDFX);
    await DFX.connect(user).allowance(userAddress, zapper.address);
    //
    //
    //
    //Set Stake Amount
    const stakeAmount = utils.parseUnits("1000", 18);
    //Zapper   - "stakeOnCurve" - Aka the "Zap Function" - see README for details
    await zapper.connect(user).stakeOnCurve(stakeAmount);
    console.log(
      "USER REQUESTED STAKE AMOUNT   " +
        ethers.utils.formatUnits(stakeAmount, 18)
    );
    //
    //
    //
    //Verify Staked Amount on dfxCAD staking contract after "Zap Function"
    const balance2 = await zapper.connect(user).balanceAt();
    console.log(
      "USER STAKED BALANCE AFTER ZAP  " + ethers.utils.formatUnits(balance2, 18)
    );
  });

  it("Verbose: Test Zap Into Stake Contract", async function () {
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
    //Free Internet Money!>!>!>!
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
    //Zapper   return Zapper address
    zapperAddress = zapper.returnAddress();
    //
    //
    //
    //User approve: transfer of balance in CADC to Zapper
    await cadc.connect(user).approve(zapper.address, amountCADCstart);
    await cadc.connect(user).allowance(userAddress, zapper.address);
    //
    //
    //
    //User approve: transfer of balance in DFX to Zapper
    await DFX.connect(user).approve(zapper.address, amountDFX);
    await DFX.connect(user).allowance(userAddress, zapper.address);
    //
    //
    //
    //Zapper   CADC Balance prior to Zap
    console.log(
      "Zapper balance CADC before Zap (units 1e18)   " +
        (await cadc.connect(user).balanceOf(zapperAddress))
    );
    //
    //
    //
    //
    //Zapper   DFX Balance prior to Zap
    console.log(
      "Zapper balance DFX before Zap (units 1e18)   " +
        (await DFX.connect(user).balanceOf(zapperAddress))
    );
    //
    //
    //
    //Zapper   dfxCAD Balance prior to Zap
    console.log(
      "Zapper balance dfxCAD before Zap (units 1e18)   " +
        (await dfxCAD.connect(user).balanceOf(zapperAddress))
    );
    //
    //
    //
    //Set Stake Amount
    const stakeAmount = utils.parseUnits("1000", 18);
    //Zapper   - "stakeOnCurve" - Aka the "Zap Function" - see README for details
    await zapper.connect(user).stakeOnCurve(stakeAmount);
    console.log("USER REQUESTED STAKE AMOUNT (units 1e18)   " + stakeAmount);
    //
    //
    //
    //Verify Staked Amount on dfxCAD staking contract after "Zap Function"
    const balance2 = await zapper.connect(user).balanceAt();
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
    //Zapper   Account
    console.log(
      "Zapper balance CADC After Zap (units 1e18)   " +
        (await cadc.connect(user).balanceOf(zapperAddress))
    );
    //
    console.log(
      "Zapper balance DFX After Zap (units 1e18)   " +
        (await DFX.connect(user).balanceOf(zapperAddress))
    );
    //
    console.log(
      "Zapper balance dfxCAD After Zap (units 1e18)   " +
        (await dfxCAD.connect(user).balanceOf(zapperAddress))
    );
    //
    //
    //
    //Grab Burn Fee for Spreadsheet
    console.log(
      "dfxCAD mintBurnFee " + (await dfxCAD.connect(user).mintBurnFee())
    );
    //Grab Underlyings for request minted dfxCAD i.e. request stake amount/2 + mintBurnFee
    //or (1000/2)*(1+mintBurnFee) = 502.5
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
    //Seperate From Zap - Possible Clarification on mint Fee in dfxCAD Documentation
    const mintAmount = parseUnits("1000", 18);
    const [CADCa2, DFXa2] = await dfxCAD
      .connect(user)
      .getUnderlyings(mintAmount);
    console.log(
      "Seperate from Zap Test: CADC amount for minting 1000 dfxCAD " +
        CADCa2 +
        ",  DFX Amount for minting 1000 dfxCAD " +
        DFXa2
    );
    //Approve transfer of CADC and DFX from user to dfxCAD to allow mint
    await cadc
      .connect(user)
      .approve(dfxCADAddress, ethers.constants.MaxUint256);
    await DFX.connect(user).approve(dfxCADAddress, ethers.constants.MaxUint256);
    //Mint 1000 dfxCAD
    //
    await dfxCAD.connect(user).mint(mintAmount);
    //Return Balance dfxCAD
    console.log(
      "Seperate from Zap Test: mint 1000 dfxCAD  " +
        (await dfxCAD.connect(user).balanceOf(userAddress))
    );
  });
});
