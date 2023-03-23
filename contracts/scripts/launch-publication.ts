import { ethers } from "hardhat";
import { Publius, PubliusFactory, PubliusFactory__factory } from '../typechain-types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import addresses from '../addresses.json';

async function addPublication() {
    let author: SignerWithAddress;
    const publicationName = 'Test Publication';
    const publicationCoverImage = "https://github.com/sekaieth/Publius/blob/main/Publius-Transparent-White.png?raw=true";

    [author] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory('PubliusFactory');
    const factory =  await ethers.getContractAt(addresses.PubliusFactory.abi, addresses.PubliusFactory.address, author) as PubliusFactory;
    const deployPublication = await factory.createPublication(
        1, 
        "sekaieth", 
        author.address, 
        publicationName, 
        publicationCoverImage, 
        ethers.utils.parseEther("0.1")
    );
    deployPublication.wait();

    console.log("Deployed a new publication!");
    console.info("Publication address: ", await factory.getPublicationAddress(1));
}

addPublication();