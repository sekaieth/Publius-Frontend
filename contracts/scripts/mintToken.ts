import { ethers } from "hardhat";
import { Publius } from '../typechain-types';
import hardhatAddresses from "../hardhat-contract-info.json";

async function mintToken() {
    const [author] = await ethers.getSigners();
    const publius = await ethers.getContractAt('Publius', hardhatAddresses.Publius.address, author) as Publius;
    const mint = await publius.mint(3, {value: ethers.utils.parseEther("0.3")});
    mint.wait();
    console.log("Minted Tokens!");
}
mintToken();