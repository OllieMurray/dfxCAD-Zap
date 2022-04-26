// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./interfaces/IUniswapV2Router02.sol";
import "./interfaces/IERC20.sol";
import "./interfaces/IDFX.sol";
import "./interfaces/IdfxCAD.sol";
import "./interfaces/IStakeDFXCAD.sol";


//how to import the interface into the project?
//how-where to find the interface?


contract Zapper {
    //Required Addresses
    address private constant cadcAddress = 0xcaDC0acd4B445166f12d2C07EAc6E2544FbE2Eef;
    address private constant dfxAddress = 0x888888435FDe8e7d4c54cAb67f206e4199454c60;

    address private constant dfxCADAddress = 0xFE32747d0251BA92bcb80b6D16C8257eCF25AB1C;
    address private constant dfxCADStakeAddress = 0x9CA41a2DaB3CEE15308998868ca644e2e3be5C59;

    //Required Interfaces

    IDFX private constant dfxContract = IDFX(dfxAddress);
    IdfxCAD private constant dfxCADContract = IdfxCAD(dfxCADAddress);
    IERC20 private constant CADContract = IERC20(dfxCADAddress);
    IStakeDFXCAD private constant dfxCADStake = IStakeDFXCAD(dfxCADStakeAddress);

    //variables made public to help in testing
    //can be made private, local function variables, or accessible with setters/getters
    uint public diffDFX;
    uint public diffCADC;
    uint public dfxCADBalance;
    uint public stakeAmountDFXCAD;
 


    function returnAddress() public view returns (address){
        return address(this);
    }

    function balanceAt() public view returns (uint){
        return IStakeDFXCAD(dfxCADStakeAddress).balanceOf(address(this));
    }

    //Main Zap Method
    function stakeOnCurve(uint _stakeAmount) public {
        //determine staking amounts of CADC and dfxCAD (assumes 50/50 split in staking contract)
        uint stakeAmountCADC = _stakeAmount/2;
        uint stakeAmountDfxCAD = _stakeAmount/2;

        //mint amount of dfxCAD adjusted for mintBurnFee
        uint dfxCADBurnFee = IdfxCAD(dfxCADAddress).mintBurnFee();
        stakeAmountDfxCAD = stakeAmountDfxCAD + stakeAmountDfxCAD*dfxCADBurnFee/1e18;

        //Required CADC and DFX for minting dfxCAD
        (uint cadcRequired, uint dfxRequired) = IdfxCAD(dfxCADAddress).getUnderlyings(stakeAmountDfxCAD);

        //Zapper's initial balances of cadc and dfxcad
        uint initialDFX =  IERC20(dfxAddress).balanceOf(address(this));
        uint initialCADC = IERC20(cadcAddress).balanceOf(address(this));

        //Transfer from user to this address
        //+(cadcRequired*1e16/1e18)
        //+(dfxRequired*1e16/1e18)
        //CADC
        IERC20(cadcAddress).transferFrom(msg.sender, address(this), cadcRequired+stakeAmountCADC);
        //DFX
        IERC20(dfxAddress).transferFrom(msg.sender, address(this), dfxRequired);


        //Calc diff in DFX and CADC balance using 'final___' as field name.  actual final values calculated below
        uint finalDFX =  IERC20(dfxAddress).balanceOf(address(this));
        uint finalCADC = IERC20(cadcAddress).balanceOf(address(this));
        diffDFX = finalDFX - initialDFX;
        diffCADC = finalCADC - initialCADC;


        //Approve transfer of CADC and DFX to dfxCADAddress
        IERC20(cadcAddress).approve(dfxCADAddress, diffCADC);
        IDFX(dfxAddress).approve(dfxCADAddress, diffDFX);


        ///Mint dfxCAD
        IdfxCAD(dfxCADAddress).mint(stakeAmountDfxCAD);
        dfxCADBalance = IERC20(dfxCADAddress).balanceOf(address(this));


        //approve balances for Stake Address
        IERC20(cadcAddress).approve(dfxCADStakeAddress, dfxCADBalance);
        IdfxCAD(dfxCADAddress).approve(dfxCADStakeAddress, dfxCADBalance);

        //add liquidity
        IStakeDFXCAD(dfxCADStakeAddress).add_liquidity([dfxCADBalance,dfxCADBalance],0);
        //calc dust
        finalDFX =  IERC20(dfxAddress).balanceOf(address(this));
        finalCADC = IERC20(cadcAddress).balanceOf(address(this));
        diffDFX = finalDFX - initialDFX;
        diffCADC = finalCADC - initialCADC;
        //return dust
        //cadc
        IERC20(cadcAddress).transfer(msg.sender , diffCADC);
        //DFX
        IERC20(dfxAddress).transfer(msg.sender , diffDFX);

    }

}

