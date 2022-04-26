# dfxCAD Zapper Example - DFX Hackathon Submission
This repo contains my submission for the DFX Hackathon.  It is a zapper contract (foo3) which performs the following steps all in one function call:
1. Calculate Stake Amounts of CADC and dfxCAD assuming a 50/50 ratio
2. Calculate dfxCAD amount required to mint, accounting for dfxCAD.mintBurnFee
3. Calculate required components of DFX and CADC required to mint dfxCAD using dfxCAD.getUnderlyings
4. Transfer funds from caller account to Zapper (foo3)
5. Approve CADC and DFX to transfer funds to dfxCAD
6. Call dfxCAD.mint to mint required dfxCAD
7. Approve CADC and dfxCAD to transfer funds to staking contract
8. Stake CADC and dfxCAD in staking contract by calling stakingContract.add_liquidity 


There is one test that demonstrates a range of functionality, but is primarily focused on the stakeOnCurve method in 'foo.3' (i.e. the Zapper contract).  The general steps followed in the test are:
1. Mint user a bunch of CADC and DFX
2. Approve CADC and DFX for transfers from user to Zapper (foo3)
3. Check balances of user and Zapper (foo3) before and after zap (method = stakeOnCurve)
4. Call foo3.stakeOnCurve
5. Verify Staked Amount
6. Check balances of user and Zapper (foo3) after staking

Some final helper steps are also performed: (see spreadsheet for details)
    To reconcile with steps 1-6
7. grab mintBurnFee
8. call getUnderlyings on fixed amount of dfxCAD 

    To show usage clarification of mintBurnFee (see spreadsheet for details)
9. call getUnderlying on 1000 dfxCAD
10. Mint 1000 dfxCAD


Try running the test (it is pinned to a block number and therefore should be deterministic):

```shell
yarn test
```

# Files to Ignore In Submission

Files to Ignore Foo.sol, Foo2.sol, and Foo4.sol.  These solidity files were generated during the testing and development process and may not be in a functioning state and do not reflect good coding practices or event proper flow logic.  I have left them in the project for future reference as there are useful code snippets in there.


# Environment Variables

Create a `.env` file at the project root with the following:

```
RPC_URL=https://eth-mainnet.alchemyapi.io/v2/<alchemy_api_key>
```

