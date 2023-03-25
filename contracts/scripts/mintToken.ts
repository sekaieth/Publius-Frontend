import { ethers } from "hardhat";
import { Publius } from '../typechain-types';
import scrollAddresses from "../scroll-contract-info.json";

async function mintToken() {
    const [deployer, author] = await ethers.getSigners();
    const publius = await ethers.getContractAt('Publius', scrollAddresses.Publius.address, deployer) as Publius;
    const mint = await publius.mint(1);
    mint.wait(5);
    console.log("Minted Tokens!");
}
mintToken();