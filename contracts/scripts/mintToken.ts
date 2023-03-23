import { ethers } from "hardhat";
import { Publius } from '../typechain-types';

async function mintToken() {
    const [author] = await ethers.getSigners();
    const publius = await ethers.getContractAt('Publius', '0x9f1ac54BEF0DD2f6f3462EA0fa94fC62300d3a8e', author) as Publius;
    const mint = await publius.mint(3, {value: ethers.utils.parseEther("0.3")});
    mint.wait();
    console.log("Minted Tokens!");
}
mintToken();