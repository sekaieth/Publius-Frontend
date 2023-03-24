import { ethers } from "hardhat";
import { Publius, PubliusFactory, PubliusFactory__factory } from '../typechain-types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import hardhatAddresses from "../hardhat-contract-info.json";
import devdocs from "../devdocs.json";
import * as fs from "fs";
import { Section } from "../interfaces";

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
        PubliusFactory__factory.abi,
        hardhatAddresses.PubliusFactory.address,
        author 
    ) as PubliusFactory;

    const publicationId = (await factory.publicationCount()).toNumber() + 1;
    const deployPublication = await factory.createPublication(
        publicationId, 
        author.address, 
        devdocs.author, 
        devdocs.name, 
        devdocs.image, 
        ethers.utils.parseEther("0")
    );
    deployPublication.wait();

    const publicationAddress = await factory.getPublicationAddress(publicationId);

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
            address: publicationAddress,
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
    console.info("Publication Contract Address: ", await factory.getPublicationAddress(publicationId));

    console.log("Adding content to publication...");

    const publication = await ethers.getContractAt(
        "Publius",
        publicationAddress,
        author
    ) as Publius;


    // Encode devdocs content and send to contract 
    devdocs.sections.forEach(async(section, sectionIndex) => {

        const encodedSection = ethers.utils.defaultAbiCoder.encode(
            ["string", "string", "uint256"],
            [section.sectionName, section.sectionImage, section.sectionId]
        );

        const encodedChapters = ethers.utils.defaultAbiCoder.encode(
          [
              "string[]",
              "string[]", 
              "uint256[]",
          ],
          [
            section.chapters.flatMap(chapter => chapter.chapterName),
            section.chapters.flatMap(chapter => chapter.chapterImage),
            section.chapters.flatMap(chapter => chapter.chapterId),
          ]
        );

        const encodedPages = ethers.utils.defaultAbiCoder.encode(
            [
                "string[][]",
                "string[][]",
                "uint256[][]"
            ],
            [
                section.chapters.map(chapter => chapter.pages.map(page => page.pageName)),
                section.chapters.map(chapter => chapter.pages.map(page => page.pageContent)),
                section.chapters.map(chapter => chapter.pages.map(page => page.pageId)),
            ]
        ); 

        const tx = await publication.addSection(
            encodedSection,
            encodedChapters,
            encodedPages
        );
        tx.wait();
    });

    publication.mint(1);




}

addPublication();