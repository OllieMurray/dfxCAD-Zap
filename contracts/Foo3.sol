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
        //update the argument --> what is the input amount?  deposit X funds into curve?
        //X funds represents the sum of components of CADC and dfxCAD
            //ok, so we need to know the ratios here...
        //dfxCAD is composed of ampounts 

        
        // get USDC from user into this contract
        IERC20(usdcAddress).transferFrom(msg.sender, address(this), exactUsdcAmount);

        //get DFX and CADC from user into thie contract...
        //challenge/left to fix --> how to set the amounts...
        //work backwards from the end --> how much dfxCAD and CADc --> what ratios of these
        //do we need to have to deposit curve?


        //aprrove dfxCAD address with a certain amount...

        //mint dfxCAD


        
        // allow UniswapV2 Router to spend this contract's USDC
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


    //incremental approach..
    //1. transfer CAD to this address

    //2. then transfer DFX to this address

    //3. then approve transfer to dfcCAD address --> mint!
    function transferCADC(uint exactCADCAmount) public returns (uint256) {
        //update the argument --> what is the input amount?  deposit X funds into curve?
        //X funds represents the sum of components of CADC and dfxCAD
            //ok, so we need to know the ratios here...
        //dfxCAD is composed of ampounts 

        
        // get USDC from user into this contract
        IERC20(cadcAddress).transferFrom(msg.sender, address(this), exactCADCAmount);

        //check the balance and return it....
        return IERC20(cadcAddress).balanceOf(address(this));

    }

    function transferDFX(uint exactDFXAmount) public returns (uint256) {
        //update the argument --> what is the input amount?  deposit X funds into curve?
        //X funds represents the sum of components of CADC and dfxCAD
            //ok, so we need to know the ratios here...
        //dfxCAD is composed of ampounts 

        
        // get USDC from user into this contract
        IERC20(dfxAddress).transferFrom(msg.sender, address(this), exactDFXAmount);

        //check the balance and return it....
        return IERC20(dfxAddress).balanceOf(address(this));

    }


    function mintDfxCAD(uint exactDfxCADAmount) public returns (uint256) {
        //update the argument --> what is the input amount?  deposit X funds into curve?
        //X funds represents the sum of components of CADC and dfxCAD
            //ok, so we need to know the ratios here...
        //dfxCAD is composed of ampounts 

        //approve CAD to transfer to dfxCAD address
        //approve DFX to transfer to dfxCAD address
        IERC20(cadcAddress).approve(dfxCADAddress, exactDfxCADAmount);
        IDFX(dfxAddress).approve(dfxCADAddress, exactDfxCADAmount);

        //
        uint mintAmount = 100;
        // get USDC from user into this contract
        //IERC20(dfxAddress).transferFrom(msg.sender, address(this), exactDFXAmount);
        //await dfxCAD.connect(user).mint(parseUnits("1000", 18));
        IdfxCAD(dfxCADAddress).mint(mintAmount);

        //check the balance and return it....
        return IERC20(dfxCADAddress).balanceOf(address(this));

    }


    function stake() public {
        //update the argument --> what is the input amount?  deposit X funds into curve?
        //X funds represents the sum of components of CADC and dfxCAD
            //ok, so we need to know the ratios here...
        //dfxCAD is composed of ampounts 

        //approve CAD to transfer to dfxCAD address
        //approve DFX to transfer to dfxCAD address
        uint stakeAmount = 10;
        IERC20(cadcAddress).approve(dfxCADStakeAddress, stakeAmount);
        IdfxCAD(dfxCADAddress).approve(dfxCADStakeAddress, stakeAmount);
    
        // get USDC from user into this contract
        //IERC20(dfxAddress).transferFrom(msg.sender, address(this), exactDFXAmount);
        //await dfxCAD.connect(user).mint(parseUnits("1000", 18));
        IStakeDFXCAD(dfxCADStakeAddress).add_liquidity([stakeAmount,stakeAmount],0);
        // STKTKN.connect(user).add_liquidity(
        // [
        //     cadc.connect(user).balanceOf(userAddress),
        //     DFX.connect(user).balanceOf(userAddress),
        // ],
        // 0
        // );
        //check the balance and return it....
        //return IERC20(dfxCADAddress).balanceOf(address(this));

    }



    function returnAddress() public view returns (address){
        return address(this);
    }

    function balanceAt() public view returns (uint){
        return IStakeDFXCAD(dfxCADStakeAddress).balanceOf(address(this));
    }


    function stakeOnCurve(uint _stakeAmount) public returns (uint) {
        //determine relative amounts of staking tokens
        //staking currently requires 50/50 ratios...
        //future versions of zap could call a function in staking contract to determine ratios
        //of CADC and dfxCAD
        uint stakeAmountCADC = _stakeAmount/2;
        uint stakeAmountDfxCAD = _stakeAmount/2;
        //return stakeAmountDfxCAD;//10;//stakeAmountDfxCAD;

        stakeAmountCADCGlobal = stakeAmountCADC;

        //the required mint amount of dfxCAD is given by stakeAmountDfxCAD/(1+burnfee)
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
        IERC20(cadcAddress).transferFrom(msg.sender, address(this), cadcRequired+(cadcRequired*1e16/1e18));
        // //DFX
        IERC20(dfxAddress).transferFrom(msg.sender, address(this), dfxRequired+(dfxRequired*1e16/1e18));

        //final cadC and dfx
        uint finalDFX =  IERC20(dfxAddress).balanceOf(address(this));
        uint finalCADC = IERC20(cadcAddress).balanceOf(address(this));

        //difference cadc and def
        diffDFX = finalDFX - initialDFX;
        diffCADC = finalCADC - initialCADC;


        //return dfxRequired;

        // //approve exact amount of cad for transfer 
        //approve the current balance/change in balance of dfxCAD?
        //some issue going on with the approval here...
        //we need to go through the calculation in detail...
        //
        //
        //
        //fix these later... approval is too high...
        //have done that just as a buffer...
        //
        IERC20(cadcAddress).approve(dfxCADAddress, diffCADC*1e18);
        

        //approve exact amount of DFX for transfer
        //
        //
        //
        IDFX(dfxAddress).approve(dfxCADAddress, diffDFX*1e18);

        //total mint amount
        //uint mintAmount = ;


        //mint dfxCAD 
        //IdfxCAD(dfxCADAddress).mint(10);
        //
        //
        //
        tracker = diffDFX+diffCADC;//-(diffDFX+diffCADC)*dfxCADBurnFee/1e18;//-(diffDFX+diffCADC)*mintTolerance/1e18;
        dfxCADMintRequiredGlobal = dfxCADMintRequired;
        IdfxCAD(dfxCADAddress).mint(10);
        //dfxCADBalance = IERC20(dfxCADAddress).balanceOf(address(this));



        //approve staking...
        //
        //
        //
        // IERC20(cadcAddress).approve(dfxCADStakeAddress, dfxCADBalance);
        // IdfxCAD(dfxCADAddress).approve(dfxCADStakeAddress, dfxCADBalance);

        //might want to come back to this and make it robust to slippage?

        //add liquidity
        //
        //
        //
        //IStakeDFXCAD(dfxCADStakeAddress).add_liquidity([dfxCADBalance,dfxCADBalance],0);

    }


     function stakeOnCurveWorking(uint _stakeAmount) public returns (uint) {
        //determine relative amounts of staking tokens
        //staking currently requires 50/50 ratios...
        //future versions of zap could call a function in staking contract to determine ratios
        //of CADC and dfxCAD
        uint stakeAmountCADC = _stakeAmount/2;
        uint stakeAmountDfxCAD = _stakeAmount/2;
        //return stakeAmountDfxCAD;//10;//stakeAmountDfxCAD;

        stakeAmountCADCGlobal = stakeAmountCADC;

        //the required mint amount of dfxCAD is given by stakeAmountDfxCAD/(1+burnfee)
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


        //return dfxRequired;

        // //approve exact amount of cad for transfer 
        //approve the current balance/change in balance of dfxCAD?
        //some issue going on with the approval here...
        //we need to go through the calculation in detail...
        //
        IERC20(cadcAddress).approve(dfxCADAddress, diffCADC*1e18);
        

        //approve exact amount of DFX for transfer
        IDFX(dfxAddress).approve(dfxCADAddress, diffDFX*1e18);

        //total mint amount
        //uint mintAmount = ;


        //mint dfxCAD 
        //IdfxCAD(dfxCADAddress).mint(10);

        tracker = (diffDFX+diffCADC);//-(diffDFX+diffCADC)*mintTolerance/1e17
        IdfxCAD(dfxCADAddress).mint(tracker);
        dfxCADBalance = IERC20(dfxCADAddress).balanceOf(address(this));
        //contract does result in some small slippage...
        //contract does result in some small slippage...
        

        //check the balance of dfxCADMinted --> it should match...
        //our earlier value of --> 
        //return IERC20(dfxCADAddress).balanceOf(address(this));

        //if this checks out then we are good to go to stake...
        //then clean up... sol, test
        //then add comments on improvements...
        //



        //approve staking...
        IERC20(cadcAddress).approve(dfxCADStakeAddress, dfxCADBalance);
        IdfxCAD(dfxCADAddress).approve(dfxCADStakeAddress, dfxCADBalance);

        //might want to come back to this and make it robust to slippage?

        //add liquidity
        IStakeDFXCAD(dfxCADStakeAddress).add_liquidity([dfxCADBalance,dfxCADBalance],0);



        //uint amountDFXRequire =
        // uint mintAmountDFXCAD = stakeAmountDfxCAD/(1+dfxCADBurnFee);
        
        //return stakeAmountDfxCAD;//
        //return dfxCADBurnFee;
        //return 1e18;
        //return dfxCADBurnFeeAmount;
        //return dfxCADMintRequired;
        //return dfxRequired;
        //
        //return mintAmountDFXCAD;
        //check out what the decimals are doing...



    }


    // function decimalConverter(uint decType, uint amount) private pure returns (uint){
    //     if (decType==0){
    //         //10^6 convention from CADC
    //     }else{
    //         //10^18 convention from all others

    //     }
    //     return 10;
    // }

}


//critical comments
   //we might want to break down the above into smaller steps for the purposes of testing...

    //1 set the outline and the overall vision for how the contract works...
    //2 break down how we would test each component...
    //3 in order to get the  small components working, what do we need to do? from a testing stanpoint
        //a. bringing in the interfaces?
        //b. are the contract updates we make being carried over into the test environment?
                //look at the beginning of sample-test.js
                //before all, there is the opportunity to deploy contracts, we are tyring to deploy the second contract..
                //is this working as expected?
        //c. are we running the tests properly... e.g. 



    //testing some stuff out in sample-test.js
        //1. what is the starting amount of usdc in the first test? --> it starts off at zero, it ends at 1000 or some weird
        //number representation, 1000000000 to represent 1000.000000 --> so this is how decimals are handled in solidity work...
        //
        //2. what is the starting amount of usdc in swap in the first ETH test? it is 1000.000000
        //3. the amount of usdc swap at the end of the first ETH test is zero. it is all swapped out
        //4. to check that the second swap test works when making reference to 'Foo2' --> 
                //mint 2000 usdc in the very first test...
                //end usdc amount after the first swap test should be 1000
                //then second swap test that used Foo2 should work!
                //if it does, we can move onto step 5!
                //CONGRATS, we can move onto step 5!!!!



            //for the below, we need to pull the interfaces...
            //where can we find these?
            //check the DFX repo from Adrian/Kyle --> can we find the interfaces there?
            //or should we just create the interface ourselves?
            //1. does Kyle have them on hand?
            //2. does Adrian have them on hand?
            //3. should we just make them up from scratch? --> this seems like one potential approach to take...

            // --> ok just make it from scratch is the way to gooo...

            //interfaces.sol files we need to have...
            //DFX interface -- > need to call approve, transferfrom, balance of
            //dfxCAD interface --> need to call 


            //structuring the class development...
                //1.transferfrom DFX to this address
                    //return balance of this address as check ! 
                //2.transferfrom CADC to this address
                    //return balance of this address as check !
                //3.approve transfer to dfxCAD address
                    //approve transfer to dfxCAD address 
                    //-> do this within the 
                    //cal mint
                    //return balance of this address as check!
                //4. add liquidity to staking contract...
                    //


                //then come back and use dfxCAD --> get amounts in order to ensure we mint the right amount of dfxCAD!
                //we might need to account for things like fees...
                //e.g. mint burn fees etc...
                //
            


        //5. Ok, so given the above, what do we need to have in place for testing the zap!
            //1. CADC and DFX already in the account...
            //2. call zap!
                //3. zap needs to mint dfxCAD
                    //foo3 then --> just mint dfxCAD!
                //4. zap needs deposit dfxCAD and CAD in staking contract...
                    //foo4 then --> givem 
                    //would be good to return the balance from the 
                //5. zap needs to combine steps 3 and 4 into one 
                //come back and worry about all the amounts lining up etc...
                //

            //requirement for doing the above --> how to bring the interaces into play?