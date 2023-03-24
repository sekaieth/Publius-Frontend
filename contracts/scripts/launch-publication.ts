import { ethers } from "hardhat";
import { Publius, PubliusFactory, PubliusFactory__factory } from '../typechain-types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import hardhatAddresses from "../hardhat-contract-info.json";
import * as fs from "fs";

type ContractName =
    | 'PubliusImpl'
    | 'PubliusFactory'
    | "Publius"

interface Contract {
    network: string;
    address: string;
}
async function addPublication() {
    const network = await ethers.provider.getNetwork();
    let author: SignerWithAddress;
    const publicationName = 'Test Publication';
    const publicationCoverImage = "https://github.com/sekaieth/Publius/blob/main/Publius-Transparent-White.png?raw=true";

    [author] = await ethers.getSigners();
    const factory =  await ethers.getContractAt(
        PubliusFactory__factory.abi,
        hardhatAddresses.PubliusFactory.address,
        author 
    ) as PubliusFactory;
    const deployPublication = await factory.createPublication(
        2, 
        author.address, 
        "sekaieth", 
        publicationName, 
        publicationCoverImage, 
        ethers.utils.parseEther("0.1")
    );
    deployPublication.wait();

    const contracts: Record<ContractName, Contract> = ({
        PubliusImpl: {
            network: network.name === 'unknown' ? 'hardhat' : network.name,
            address: hardhatAddresses.PubliusImpl.address,
        },
        PubliusFactory: {
            network: network.name === 'unknown' ? 'hardhat' : network.name,
            address: hardhatAddresses.PubliusFactory.address,
        },
        Publius: {
            network: network.name === 'unknown' ? 'hardhat' : network.name,
            address: await factory.getPublicationAddress(1),
        }
    });

    console.log("Deployed a new publication!");
    // Stringify the Contracts Map and output to the "addresses" file
    try {
    fs.writeFileSync(
        `${network.name === 'unknown' ? 'hardhat' : network.name}-contract-info.json`,
        JSON.stringify(contracts, null, 2), 
        'utf-8');
    } catch (err) {
    console.error(err);
    } 
    console.info(`Contract info updated in ${network.name === 'unknown' ? 'hardhat' : network.name}-contract-info.json`);
}

addPublication();