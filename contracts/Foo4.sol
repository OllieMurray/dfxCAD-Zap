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


contract Foo4 {
    address private constant usdcAddress = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address private constant wethAddress = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address private constant UniV2RouterAddress = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;

    //adding the cadc and 
    address private constant cadcAddress = 0xcaDC0acd4B445166f12d2C07EAc6E2544FbE2Eef;
    address private constant dfxAddress = 0x888888435FDe8e7d4c54cAb67f206e4199454c60;

    address private constant dfxCADAddress = 0xFE32747d0251BA92bcb80b6D16C8257eCF25AB1C;
    address private constant dfxCADStakeAddress = 0x9CA41a2DaB3CEE15308998868ca644e2e3be5C59;

    IUniswapV2Router02 private constant router =  IUniswapV2Router02(UniV2RouterAddress);

    IDFX private constant dfxContract = IDFX(dfxAddress);
    IdfxCAD private constant dfxCADContract = IdfxCAD(dfxCADAddress);
    IERC20 private constant CADContract = IERC20(dfxCADAddress);
    IStakeDFXCAD private constant dfxCADStake = IStakeDFXCAD(dfxCADStakeAddress);

    uint public diffDFX;
    uint public diffCADC;
    uint private mintTolerance = 5*1e15;
    uint public tracker;
    uint public stakeAmountCADCGlobal;
    uint public stakeAmountDFXCAD;
    uint public dfxCADBalance;
    uint public dfxCADMintRequiredGlobal;



    function getWETHAddress() public pure returns (address) {
        return router.WETH();
    }

    function swapUSDCToEth(uint exactUsdcAmount, uint minEthAmount) public returns (uint) {

        IERC20(usdcAddress).transferFrom(msg.sender, address(this), exactUsdcAmount);


        IERC20(usdcAddress).approve(UniV2RouterAddress, exactUsdcAmount);

        // build the path for swapping
        address[] memory path = new address[](2);
        path[0] = usdcAddress;
        path[1] = wethAddress;

        // execute swap using UniswapV2 Router
        uint deadline = uint(block.timestamp + 60);
        uint[] memory result = router.swapExactTokensForETH(exactUsdcAmount, minEthAmount, path, msg.sender, deadline);
        return result[0];
    }


   
    function transferCADC(uint exactCADCAmount) public returns (uint256) {
        
        IERC20(cadcAddress).transferFrom(msg.sender, address(this), exactCADCAmount);

        
        return IERC20(cadcAddress).balanceOf(address(this));

    }

    function transferDFX(uint exactDFXAmount) public returns (uint256) {
       
        IERC20(dfxAddress).transferFrom(msg.sender, address(this), exactDFXAmount);

        
        return IERC20(dfxAddress).balanceOf(address(this));

    }


    function mintDfxCAD(uint exactDfxCADAmount) public returns (uint256) {
       
        IERC20(cadcAddress).approve(dfxCADAddress, exactDfxCADAmount);
        IDFX(dfxAddress).approve(dfxCADAddress, exactDfxCADAmount);

       
        uint mintAmount = 100;
       
        IdfxCAD(dfxCADAddress).mint(mintAmount);

        //check the balance and return it....
        return IERC20(dfxCADAddress).balanceOf(address(this));

    }


    function stake() public {
       
        uint stakeAmount = 10;
        IERC20(cadcAddress).approve(dfxCADStakeAddress, stakeAmount);
        IdfxCAD(dfxCADAddress).approve(dfxCADStakeAddress, stakeAmount);
    
      
        IStakeDFXCAD(dfxCADStakeAddress).add_liquidity([stakeAmount,stakeAmount],0);
      

    }



    function returnAddress() public view returns (address){
        return address(this);
    }

    function balanceAt() public view returns (uint){
        return IStakeDFXCAD(dfxCADStakeAddress).balanceOf(address(this));
    }


    function stakeOnCurve(uint _stakeAmount) public {
       
        uint stakeAmountCADC = _stakeAmount/2;
        uint stakeAmountDfxCAD = _stakeAmount/2;
      

        stakeAmountCADCGlobal = stakeAmountCADC;

        //the required mint amount of dfxCAD is given by stakeAmountDfxCAD/(1+burnfee)
        uint dfxCADBurnFee = IdfxCAD(dfxCADAddress).mintBurnFee();
        stakeAmountDfxCAD = stakeAmountDfxCAD + stakeAmountDfxCAD*dfxCADBurnFee/1e18;
        // uint dfxCADBurnFeeAmount = stakeAmountDfxCAD*dfxCADBurnFee/1e18;
        // uint dfxCADMintRequired = stakeAmountDfxCAD + dfxCADBurnFeeAmount;
        
      

        (uint cadcRequired, uint dfxRequired) = IdfxCAD(dfxCADAddress).getUnderlyings(stakeAmountDfxCAD);

       
        uint initialDFX =  IERC20(dfxAddress).balanceOf(address(this));
        uint initialCADC = IERC20(cadcAddress).balanceOf(address(this));



    
        IERC20(cadcAddress).transferFrom(msg.sender, address(this), cadcRequired+(cadcRequired*1e16/1e18)+stakeAmountCADC);
      
        IERC20(dfxAddress).transferFrom(msg.sender, address(this), dfxRequired+(dfxRequired*1e16/1e18));

     
        uint finalDFX =  IERC20(dfxAddress).balanceOf(address(this));
        uint finalCADC = IERC20(cadcAddress).balanceOf(address(this));

        diffDFX = finalDFX - initialDFX;
        diffCADC = finalCADC - initialCADC;


        //return dfxRequired;

        IERC20(cadcAddress).approve(dfxCADAddress, diffCADC*1e18);
        

    
        IDFX(dfxAddress).approve(dfxCADAddress, diffDFX*1e18);

      
        tracker = diffDFX+diffCADC;//-(diffDFX+diffCADC)*dfxCADBurnFee/1e18;//-(diffDFX+diffCADC)*mintTolerance/1e18;
        dfxCADMintRequiredGlobal = stakeAmountDfxCAD ;
        IdfxCAD(dfxCADAddress).mint(stakeAmountDfxCAD);
        dfxCADBalance = IERC20(dfxCADAddress).balanceOf(address(this));

    
        IERC20(cadcAddress).approve(dfxCADStakeAddress, dfxCADBalance);
        IdfxCAD(dfxCADAddress).approve(dfxCADStakeAddress, dfxCADBalance);

       
        IStakeDFXCAD(dfxCADStakeAddress).add_liquidity([dfxCADBalance,dfxCADBalance],0);
     
        finalDFX =  IERC20(dfxAddress).balanceOf(address(this));
        finalCADC = IERC20(cadcAddress).balanceOf(address(this));
        diffDFX = finalDFX - initialDFX;
        diffCADC = finalCADC - initialCADC;
        //cadc
        IERC20(cadcAddress).transfer(msg.sender , diffCADC);
        // // //DFX
        IERC20(dfxAddress).transfer(msg.sender , diffDFX);

    }


     function stakeOnCurveWorking(uint _stakeAmount) public {
     
        uint stakeAmountCADC = _stakeAmount/2;
        uint stakeAmountDfxCAD = _stakeAmount/2;
        //return stakeAmountDfxCAD;//10;//stakeAmountDfxCAD;

        stakeAmountCADCGlobal = stakeAmountCADC;

      
        uint dfxCADBurnFee = IdfxCAD(dfxCADAddress).mintBurnFee();
        uint dfxCADBurnFeeAmount = stakeAmountDfxCAD*dfxCADBurnFee/1e18;
        uint dfxCADMintRequired = stakeAmountDfxCAD + dfxCADBurnFeeAmount;
        
        //call the ratio of DFX to CADC from the dfxCAD contract...
        uint cadcRatio = IdfxCAD(dfxCADAddress).cadcRatio();
        uint dfxRatio = IdfxCAD(dfxCADAddress).dfxRatio();

        //calc the required amounts of CADC and DFX...
        uint cadcRequired = dfxCADMintRequired*cadcRatio/1e18;
        uint dfxRequired = dfxCADMintRequired*dfxRatio/1e18;



        //initial balances of cadc and dfxcad for this contract...
        uint initialDFX =  IERC20(dfxAddress).balanceOf(address(this));
        uint initialCADC = IERC20(cadcAddress).balanceOf(address(this));



        //transfer from user address to this address
        //cadc
        IERC20(cadcAddress).transferFrom(msg.sender, address(this), cadcRequired);
        // //DFX
        IERC20(dfxAddress).transferFrom(msg.sender, address(this), dfxRequired);

        //final cadC and dfx
        uint finalDFX =  IERC20(dfxAddress).balanceOf(address(this));
        uint finalCADC = IERC20(cadcAddress).balanceOf(address(this));

        //difference cadc and def
        diffDFX = finalDFX - initialDFX;
        diffCADC = finalCADC - initialCADC;


     
        IERC20(cadcAddress).approve(dfxCADAddress, diffCADC*1e18);
        

        //approve exact amount of DFX for transfer
        IDFX(dfxAddress).approve(dfxCADAddress, diffDFX*1e18);

        //total mint amount
        //uint mintAmount = ;


      
        tracker = (diffDFX+diffCADC);//-(diffDFX+diffCADC)*mintTolerance/1e17
        IdfxCAD(dfxCADAddress).mint(tracker);
        dfxCADBalance = IERC20(dfxCADAddress).balanceOf(address(this));
      



        //approve staking...
        IERC20(cadcAddress).approve(dfxCADStakeAddress, dfxCADBalance);
        IdfxCAD(dfxCADAddress).approve(dfxCADStakeAddress, dfxCADBalance);

        //might want to come back to this and make it robust to slippage?

        //add liquidity
        IStakeDFXCAD(dfxCADStakeAddress).add_liquidity([dfxCADBalance,dfxCADBalance],0);



        //uint amountDFXRequire =
        // uint mintAmountDFXCAD = stakeAmountDfxCAD/(1+dfxCADBurnFee);
        
    



    }


  
}
