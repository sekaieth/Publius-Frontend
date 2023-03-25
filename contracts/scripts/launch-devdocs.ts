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

    // Wait 10 seconds for chain to settle
    await new Promise(resolve => setTimeout(resolve, 10000));
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

    console.log("Adding content to publication...");

    const publication = await ethers.getContractAt(
        "Publius",
        publicationAddress,
        author
    ) as Publius;


    // Wait 10 seconds for the chain to settle
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Encode devdocs content and send to contract 
    devdocs.sections.forEach(async(section, sectionIndex) => {
        const nonce = await ethers.provider.getTransactionCount(author.address) + 1;

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
            encodedPages,
            {
                nonce,
            }
        );
        tx.wait();
        console.log(`Section ${section.sectionId} added to publication!}`)
        // wait for 10 seconds before adding next section
        await new Promise(resolve => setTimeout(resolve, 20000));
    });

    publication.mint(3);




}

addPublication();