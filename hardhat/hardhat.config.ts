import dotenv from "dotenv";
import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomicfoundation/hardhat-ethers";
import "@openzeppelin/hardhat-upgrades";

import "hardhat-gas-reporter";

import {HttpNetworkHDAccountsConfig} from "hardhat/types";
dotenv.config({path:"../.env"});

const mnemonic = process.env.SEED;
console.log("truthy mnemonic", !!mnemonic);
// Generate an HD wallet from the mnemonic

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      /*viaIR: true, // Enable the IR optimizer*/
    },
  },
  networks: {
    hardhat: {
      accounts: {
        mnemonic:mnemonic
      } as HttpNetworkHDAccountsConfig
    },
    baseSepolia: {
      url: `https://base-sepolia.infura.io/v3/${process.env.INFURA_PROJECT}`,
      accounts: {
        mnemonic:mnemonic
      } as HttpNetworkHDAccountsConfig,
      httpHeaders: {
        Authorization: `Basic ${Buffer.from(`${process.env.INFURA_PROJECT}:${process.env.INFURA_SECRET}`).toString('base64')}`
      }
    },
    base: {
      url: `https://base-mainnet.infura.io/v3/${process.env.INFURA_PROJECT}`,
      accounts: {
        mnemonic:mnemonic
      } as HttpNetworkHDAccountsConfig,
      httpHeaders: {
        Authorization: `Basic ${Buffer.from(`${process.env.INFURA_PROJECT}:${process.env.INFURA_SECRET}`).toString('base64')}`
      }
    }
  },
  etherscan: {
    apiKey:{
      baseSepolia:process.env.BASESCAN_API_KEY,
      base:process.env.BASESCAN_API_KEY
    },
    customChains: [
      {
        network: "base-sepolia",
        chainId: 8453,
        urls: {
          apiURL: "https://api-sepolia.basescan.io/api/",
          browserURL: "https://sepolia.basescan.org/"
        }
      },
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org"
        }
      },
    ]
  },
  defender: {
    apiKey: process.env.YOUR_DEFENDER_API_KEY,
    apiSecret: process.env.YOUR_DEFENDER_API_SECRET,
  }
};

export default config;
