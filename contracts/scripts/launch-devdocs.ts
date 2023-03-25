import { ethers } from "hardhat";
import { Publius, PubliusFactory, PubliusFactory__factory } from '../typechain-types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import hardhatAddresses from "../hardhat-contract-info.json";
import devdocs from "../devdocs.json";
import * as fs from "fs";
import { Section } from "../interfaces";
import scrollAddresses from "../scroll-contract-info.json";

type ContractName =
    | 'PubliusImpl'
    | 'PubliusFactory'
    | "Publius"

interface Contract {
    network: string;
    address: string;
}

interface EncodedData {
    encodedSection: string;
    encodedChapters: string;
    encodedPages: string;
}
async function addPublication() {
    const network = await ethers.provider.getNetwork();
    let author: SignerWithAddress;

    [author] = await ethers.getSigners();
    const factory =  await ethers.getContractAt(
        'PubliusFactory',
        scrollAddresses.PubliusFactory.address,
        author 
    ) as PubliusFactory;

    const publicationId = (await factory.publicationCount()).toNumber() + 1;
    console.log("Deploying a new publication...ID = ", publicationId)
    const deployPublication = await factory.createPublication(
        publicationId, 
        author.address, 
        devdocs.author, 
        devdocs.name, 
        devdocs.image, 
        ethers.utils.parseEther("0")
    );
    deployPublication.wait();

    // Wait 5 seconds for chain to settle
    await new Promise(resolve => setTimeout(resolve, 5000));
    const publicationAddress = await factory.getPublicationAddress(publicationId);

    const contracts: Record<ContractName, Contract> = ({
        PubliusImpl: {
            network: "scroll",
            address: scrollAddresses.PubliusImpl.address,
        },
        PubliusFactory: {
            network: "scroll",
            address: scrollAddresses.PubliusFactory.address,
        },
        Publius: {
            network: "scroll",
            address: publicationAddress,
        }
    });

    console.log("Deployed a new publication!");
    // Stringify the Contracts Map and output to the "addresses" file
    try {
        fs.writeFileSync(
            `scroll-contract-info.json`,
            JSON.stringify(contracts, null, 2), 
            'utf-8'
        );
    } catch (err) {
    console.error(err);
    } 
    console.info(`Contract info updated in scroll-contract-info.json`);
    console.info("Publication Contract Address: ", publicationAddress);





}

addPublication();