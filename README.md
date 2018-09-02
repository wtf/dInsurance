# README

This dApp allows users to create self-executing insurance policies for earthquakes that release Ether to a list of addresses. It uses Oraclize to query the USGS website and count the number of earthquakes above a given `magnitude` within a given `radius` around a `lat,lng` pair and within `start_date` and `end_date`. Once the count is above 0, it means that an earthquake has occurred within the specified parameters, and the policy executes.

The dApp interface shows a world map that allows the user to pick any location in the world, and automatically translates it into the corresponding `lat,lng`values. Further, they enter the remaining parameters and create a *policy*. Upon calling the `ping()` function of the smart contract (which is done via the "Release Eligible Policies" button on the dApp, but can also be done directly), the query is sent to Oraclize, which later triggers the callback function to release funds for all qualifying policies.

# Installation

## Set up npm and truffle

This should be obvious. If not, please follow the instructions from their documentations carefully.
It is best to set the permissions for npm correctly so that repeated `sudo`ing is not required.
For me, the following commands were useful, although this may depend on your local setup:
```
$ sudo chown $USER /usr/local/lib/node_modules/ -R
$ sudo chown $USER /usr/lib/node_modules/ -R
```
_Option Two_ under https://docs.npmjs.com/getting-started/fixing-npm-permissions might be useful too.

## Install openzeppelin-solidity

```
$ npm install openzeppelin-solidity
```


## Install lite-server

```
$ npm install lite-server
```

## Install Oraclize-API
This is optional because it is already included in the repo. But in case there's a related error, you should uninstall/reinstall it.
```
$ truffle install oraclize-api
```

## Install Ethereum-Bridge
In order to run Oraclize on the development server, we need to install ethereum-bridge.
```
$ npm install -g ethereum-bridge
```
## Run Ganache

```
$ ganache-cli -b 5 -d -m "leopard short thing brick lumber artwork reveal pitch awful praise goose size"
```
The pre-specified mnemonic allows us to use  Ganache alongside Oraclize, which requires deterministic addresses.
`-b 5` sets the block time to 5 seconds (to help the dApp frontend and Oraclize to catch up).

**For testing, please remove `-b 5` otherwise it the tests will run very slowly.**
```
$ ganache-cli -d -m "leopard short thing brick lumber artwork reveal pitch awful praise goose size" # only for running truffle test
```
## Run Ethereum-Bridge

```
$ ethereum-bridge -H localhost:8545 -a 9 --dev
```
This takes a little while, so wait for it to complete before proceeding. When it says `(Ctrl+C to exit)`, you can proceed.

## Compile and Deploy contracts using Truffle

```
$ truffle compile
$ truffle migrate
```
After this, make sure to **restart Metamask** so that it picks up the new localhost RPC server. In order to do this, disable Metamask and re-enable it, and then click on it and enter the password. Make sure Metamask is connected to `localhost:8545` and you're logged in.

## And finally, run the local dev server (lite-server)

```
$ npm run dev
```
And we should be good to go! If the browser does not automatically load the dApp, just visit http://localhost:3000
