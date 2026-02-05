require("@nomicfoundation/hardhat-toolbox");  // Line 1: Import.
module.exports = {  // Line 2: Config.
  solidity: "0.8.0",  // Line 3: Version.
  networks: {  // Line 4: Networks.
    sepolia: {  // Line 5: Testnet.
      url: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",  // Line 6: RPC (replace key).
      accounts: ["YOUR_METAMASK_PRIVATE_KEY"]  // Line 7: Wallet key (export from MetaMask, careful!).
    }
  }
}