import { HardhatUserConfig } from "hardhat/config";
import * as dotenv from "dotenv";
import "@openzeppelin/hardhat-upgrades";
import "@nomicfoundation/hardhat-toolbox";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    scroll: {
      url: process.env.SCROLL_URI || "",
      accounts: 
        process.env.SCROLL_PRIVKEY !== undefined ? [process.env.SCROLL_PRIVKEY] : [],
    }
  },
};

export default config;
