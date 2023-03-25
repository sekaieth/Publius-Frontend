import { ethers } from "hardhat";
import { Publication } from '../interfaces';
import hardhatAddresses from "../hardhat-contract-info.json";
import scrollAddresses from "../scroll-contract-info.json";
import devdocs from "../devdocs.json";
import { PubliusFactory, Publius } from "../typechain-types";

async function addSection() {
    let encodedSection: string;
    let encodedChapters: string;
    let encodedPages: string;
    const [author] = await ethers.getSigners();

    // Encode devdocs content 
    const section = devdocs.sections[3];
      encodedSection = ethers.utils.defaultAbiCoder.encode(
          ["string", "string", "uint256"],
          [section.sectionName, section.sectionImage, section.sectionId]
      );

      encodedChapters = ethers.utils.defaultAbiCoder.encode(
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

        encodedPages = ethers.utils.defaultAbiCoder.encode(
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

      // Instantiate the factory contract
      const factory = await ethers.getContractAt(
          "PubliusFactory",
          scrollAddresses.PubliusFactory.address,
          author
      ) as PubliusFactory;

      // Get the address of the publication
      const publicationAddress = factory.getPublicationAddress(await factory.publicationCount());

      // Instantiate the publication contract
      const publication = await ethers.getContractAt(
          "Publius",
          publicationAddress,
          author
      ) as Publius;

      // Add the section to the publication
      const tx = await publication.addSection(
          encodedSection,
          encodedChapters,
          encodedPages,
      );
      tx.wait(5);
      console.log(`Section ${section.sectionId} added to publication!`)
}


addSection();