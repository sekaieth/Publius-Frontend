import { ethers } from "hardhat";

async function getTokenURI() {
    const [author] = await ethers.getSigners();
    const publius = await ethers.getContractAt('Publius', '0x9f1ac54BEF0DD2f6f3462EA0fa94fC62300d3a8e', author);
    const tokenURI = await publius.tokenURI(1);
    console.log(tokenURI);
}

getTokenURI();