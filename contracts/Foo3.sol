pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./interfaces/IUniswapV2Router02.sol";
import "./interfaces/IERC20.sol";
import "./interfaces/IDFX.sol";
import "./interfaces/IdfxCAD.sol";
import "./interfaces/IStakeDFXCAD.sol";


//how to import the interface into the project?
//how-where to find the interface?


contract Foo3 {
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
        //determine relative amounts of staking tokens
        //staking currently requires 50/50 ratios...
        uint stakeAmountCADC = _stakeAmount/2;
        uint stakeAmountDfxCAD = _stakeAmount/2;


        //the required mint amount of dfxCAD to call in dfxCAD mint must be adjusted for Burn Fee
        uint dfxCADBurnFee = IdfxCAD(dfxCADAddress).mintBurnFee();
        stakeAmountDfxCAD = stakeAmountDfxCAD + stakeAmountDfxCAD*dfxCADBurnFee/1e18;

        //Calculate Required Amounts of cadc and dfx in order to mint stakeAmountDfxCAD adjusted for Burn Fee
        (uint cadcRequired, uint dfxRequired) = IdfxCAD(dfxCADAddress).getUnderlyings(stakeAmountDfxCAD);


        //initial balances of cadc and dfxcad for this contract...
        //will be used when returning 'dust' back to zap caller
        uint initialDFX =  IERC20(dfxAddress).balanceOf(address(this));
        uint initialCADC = IERC20(cadcAddress).balanceOf(address(this));


        //transfer from user address to this address
        //Added small error Tolerance e.g. (cadcRequired*1e16/1e18)
        //Could be cleaned up in future versions
        //cadc
        IERC20(cadcAddress).transferFrom(msg.sender, address(this), cadcRequired+(cadcRequired*1e16/1e18)+stakeAmountCADC);
        //DFX
        IERC20(dfxAddress).transferFrom(msg.sender, address(this), dfxRequired+(dfxRequired*1e16/1e18));


        //!!!!!!!!!!!!!
        //final cadC and dfx
        //Calculation of 'final' balances at this point in flow are left over from testing
        //Actual final balances determined after calling dfxCAD mint and staking contract further below
        uint finalDFX =  IERC20(dfxAddress).balanceOf(address(this));
        uint finalCADC = IERC20(cadcAddress).balanceOf(address(this));
        //Left Over From Testing, can be removed
        diffDFX = finalDFX - initialDFX;
        diffCADC = finalCADC - initialCADC;


        //Approve transfer of CADC and DFX to dfxCADAddress
        IERC20(cadcAddress).approve(dfxCADAddress, diffCADC*1e18);
        IDFX(dfxAddress).approve(dfxCADAddress, diffDFX*1e18);


        ///Mint dfxCAD
        IdfxCAD(dfxCADAddress).mint(stakeAmountDfxCAD);
        dfxCADBalance = IERC20(dfxCADAddress).balanceOf(address(this));


        //approve balances for Stake Address
        IERC20(cadcAddress).approve(dfxCADStakeAddress, dfxCADBalance);
        IdfxCAD(dfxCADAddress).approve(dfxCADStakeAddress, dfxCADBalance);

        //add liquidity
        IStakeDFXCAD(dfxCADStakeAddress).add_liquidity([dfxCADBalance,dfxCADBalance],0);
        //
        finalDFX =  IERC20(dfxAddress).balanceOf(address(this));
        finalCADC = IERC20(cadcAddress).balanceOf(address(this));
        diffDFX = finalDFX - initialDFX;
        diffCADC = finalCADC - initialCADC;
        //cadc
        IERC20(cadcAddress).transfer(msg.sender , diffCADC);
        // // //DFX
        IERC20(dfxAddress).transfer(msg.sender , diffDFX);

    }


    //All Below are Helper Functions Used in Dev Process
    //They are not used in the Zap Function above
    //should not be viewed as part of submisison, may not be in performant state (e.g. using hardcoded values...)
    function transferCADC(uint exactCADCAmount) public returns (uint256) {

        IERC20(cadcAddress).transferFrom(msg.sender, address(this), exactCADCAmount);
        return IERC20(cadcAddress).balanceOf(address(this));

    }

    function transferDFX(uint exactDFXAmount) public returns (uint256) {

        IERC20(dfxAddress).transferFrom(msg.sender, address(this), exactDFXAmount);

        return IERC20(dfxAddress).balanceOf(address(this));

    }

    //not part of submission!
    function mintDfxCAD(uint exactDfxCADAmount) public returns (uint256) {

        //approve CAD to transfer to dfxCAD address
        //approve DFX to transfer to dfxCAD address
        IERC20(cadcAddress).approve(dfxCADAddress, exactDfxCADAmount);
        IDFX(dfxAddress).approve(dfxCADAddress, exactDfxCADAmount);

        //hard CODED - FIX
        uint mintAmount = 100;
        IdfxCAD(dfxCADAddress).mint(mintAmount);

        //check the balance and return it....
        return IERC20(dfxCADAddress).balanceOf(address(this));

    }


    function stake() public {
        //Hard CODED - FIX!!
        uint stakeAmount = 10;
        IERC20(cadcAddress).approve(dfxCADStakeAddress, stakeAmount);
        IdfxCAD(dfxCADAddress).approve(dfxCADStakeAddress, stakeAmount);
    
        IStakeDFXCAD(dfxCADStakeAddress).add_liquidity([stakeAmount,stakeAmount],0);

    }

}

