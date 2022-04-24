pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./interfaces/IUniswapV2Router02.sol";
import "./interfaces/IERC20.sol";

//import necessary interfaces...
//cadc --> IERC20?
//DFX --> its own...
//dfxCAD -->
//stakeContract --> 

//how to import the interface into the project?
//how-where to find the interface?


contract ZapWithComments {
    address private constant usdcAddress = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address private constant wethAddress = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address private constant UniV2RouterAddress = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;

    //adding the cadc and 
    address private constant cadcAddress = 0xcaDC0acd4B445166f12d2C07EAc6E2544FbE2Eef;
    address private constant dfxAddress = 0x888888435FDe8e7d4c54cAb67f206e4199454c60;

    address private constant dfxCADAddress = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address private constant dfxCADStakeAddress = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

    IUniswapV2Router02 private constant router =  IUniswapV2Router02(UniV2RouterAddress);

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

        //workbackwards --> what ratios of 
        IERC20(usdcAddress).transferFrom(msg.sender, address(this), exactUsdcAmount);
        IERC20(usdcAddress).transferFrom(msg.sender, address(this), exactUsdcAmount);


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

    




}
