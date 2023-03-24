import { ethers } from "hardhat";
import hardhatAddresses from "../hardhat-contract-info.json";

async function getTokenURI() {
    const [author] = await ethers.getSigners();
    const publius = await ethers.getContractAt('Publius', hardhatAddresses.Publius.address, author);
    const tokenURI = await publius.tokenURI(1);
    console.log(tokenURI);
}

getTokenURI();