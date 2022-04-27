# dfxCAD Zapper Example - DFX Hackathon Submission
This repo contains my submission for the DFX Hackathon.  It is a zapper contract which performs the following steps all in one function call:
1. Calculate Stake Amounts of CADC and dfxCAD assuming a 50/50 ratio
2. Calculate dfxCAD amount required to mint, accounting for dfxCAD.mintBurnFee
3. Calculate required components of DFX and CADC required to mint dfxCAD using dfxCAD.getUnderlyings
4. Transfer funds from caller account to Zapper  
5. Approve CADC and DFX to transfer funds to dfxCAD
6. Call dfxCAD.mint to mint required dfxCAD
7. Approve CADC and dfxCAD to transfer funds to staking contract
8. Stake CADC and dfxCAD in staking contract by calling stakingContract.add_liquidity 


There are two tests (sample-test.js) that demonstrates a range of functionality, but are primarily focused on the stakeOnCurve method in 'Zapper'.  The general steps followed in the tests are:

Main Test:

1.  State requested Zap Amount (amount to stake)
2.  Zap request Zap Amount and return Staked Balance


Verbose Test:

1. Mint user a bunch of CADC and DFX
2. Approve CADC and DFX for transfers from user to Zapper
3. Check balances of user and Zapper before and after zap (method = stakeOnCurve)
4. Call Zapper.stakeOnCurve
5. Verify Staked Amount
6. Check balances of user and Zapper after staking

Some final helper steps are also performed in verbose test: (see spreadsheet for details).  These are used to check steps 1-6 (expanded on in spreadsheet):

7.  grab mintBurnFee
8.  call getUnderlyings on fixed amount of dfxCAD 

To show usage clarification of mintBurnFee (see spreadsheet for details):

9.  call getUnderlying on 1000 dfxCAD
10.  Mint 1000 dfxCAD


To run deterministic tests:

```shell
yarn test
```

# Files to Ignore In Submission

Files to ignore: Foo4.sol, Uniswap Interfaces.  These solidity files were generated during the testing and development process and may not be in a functioning state and do not reflect good coding practices or even proper flow logic.  I have left them in the project for future reference as there are useful code snippets in there.  There are some useful helper functions in there that could be used in future work.


# Environment Variables

Create a `.env` file at the project root with the following:

```
RPC_URL=https://eth-mainnet.alchemyapi.io/v2/<alchemy_api_key>
```

