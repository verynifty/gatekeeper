/**
 * @type import('hardhat/config').HardhatUserConfig
 */

 require("@nomiclabs/hardhat-ethers");

 require("@nomiclabs/hardhat-etherscan");
 require("dotenv").config();
 
 // This is a sample Hardhat task. To learn how to create your own go to
 // https://hardhat.org/guides/create-task.html
 task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
   const accounts = await hre.ethers.getSigners();
 
   for (const account of accounts) {
     console.log(account.address);
   }
 });
 
 //
 // Select the network you want to deploy to here:
 //
 const defaultNetwork = "goerli";
 
 module.exports = {
   defaultNetwork,
   networks: {
     hardhat: {
       forking: {
         url: `https://mainnet.infura.io/v3/${process.env.INFURA}`,
         blockNumber: 15409855,
         // accounts: [process.env.KEY],
       },
     },
     localhost: {
       url: "http://localhost:8545",
       allowUnlimitedContractSize: true,
       timeout: 1800000,
 
       /*
             notice no mnemonic here? it will just use account 0 of the hardhat node to deploy
             (you can put in a mnemonic here to set the deployer locally)
       */
     },
 
     mainnet: {
       url: `https://mainnet.infura.io/v3/${process.env.INFURA}`,
       // accounts: [process.env.KEY],
       accounts: [process.env.KEY],
       gasPrice: 23000000000,
     },
     ropsten: {
       url: `https://ropsten.infura.io/v3/${process.env.INFURA}`,
       // accounts: [process.env.KEY],
       accounts: [process.env.KEY],
       gasPrice: 19000000000,
     },
     rinkeby: {
       url: `https://rinkeby.infura.io/v3/${process.env.INFURA}`,
       // accounts: [process.env.KEY],
       accounts: [process.env.KEY],
       gasPrice: 19000000000,
     },
     goerli: {
       url: `https://goerli.infura.io/v3/${process.env.INFURA}`,
       // accounts: [process.env.KEY],
       accounts: [process.env.KEY],
       gasPrice: 100000000000,
     },
   },
   etherscan: {
     apiKey: process.env.ETHERSCAN,
     url: "https://api.etherscan.com/",
   },
   solidity: {
     compilers: [
       {
         version: "0.8.9",
         settings: {
           optimizer: {
             enabled: true,
             runs: 200,
           },
         },
       },
     ],
   },
 };