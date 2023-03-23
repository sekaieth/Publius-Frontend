import { ethers, network, upgrades } from "hardhat";
import { expect } from 'chai';
import { Publius, PubliusFactory } from '../typechain-types';
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { 
    Publication,
} from '../interfaces';



describe('Test Adding A Section', () => {
    let publius: Publius;
    let deployer: SignerWithAddress;
    let author: SignerWithAddress;
    let publicationName: string;
    let publicationCoverImage: string;
    let authorWalletPublius: Publius;
    let publication: Publication;
    let encodedSections: string; 
    let encodedChapters: string;
    let encodedPages: string;
    let factory: PubliusFactory;

  beforeEach(async () => {
      publicationName = 'Test Publication';
      publicationCoverImage = "https://github.com/sekaieth/Publius/blob/main/Publius-Transparent-White.png?raw=true";
      [deployer, author] = await ethers.getSigners();

      // Deploy the implementation contract
      const Publius = await ethers.getContractFactory('Publius');
      const publiusInstance = await Publius.deploy();
      await publiusInstance.deployed();

      // Deploy the factory contract, which will also deploy the Beacon contract
      const PubliusFactory = await ethers.getContractFactory('PubliusFactory');
      factory = await PubliusFactory.deploy(publiusInstance.address) as PubliusFactory;
      await factory.deployed();

      // Deploy the first publication
      const deployPublication = await factory.createPublication(1, author.address, "sekaieth", publicationName, publicationCoverImage);
      await deployPublication.wait();

      publius = await ethers.getContractAt('Publius', await factory.getPublicationAddress(1)) as Publius;

    authorWalletPublius = publius.connect(author);

    const content =  "# Lorem Ipsum **Lorem ipsum dolor sit amet**, _consectetur adipiscing elit_. ## Integer et Molestie Proin `sed ullamcorper` orci: ```javascript let aenean = 'hendrerit'; const curabitur = 'mauris'; ``` ## Imperdiet et Consectetur Phasellus `vestibulum`: ```javascript function loremIpsum(nunc) { return `Vivamus eu: ${nunc}`; } ``` Nulla facilisi, sed `do eiusmod tempor incididunt` ut labore et dolore magna aliqua.";

    publication= {
      name: "Test Publication",
      author: "sekaieth",
      image: "https://github.com/sekaieth/Publius/blob/main/Publius-Transparent-White.png?raw=true",
      sections: [
        {
          sectionId: "1",
          sectionName: "Section 1",
          sectionImage: "https://github.com/sekaieth/Publius/blob/main/Publius-Transparent-White.png?raw=true",
          chapters: [
            {
              chapterId: "1",
              chapterName: "Chapter 1",
              chapterImage: "https://github.com/sekaieth/Publius/blob/main/Publius-Transparent-White.png?raw=true",
              pages: [
                {
                  pageId: "1",
                  pageName: "Page 1",
                  pageContent: content,
                },
                {
                  pageId: "2",
                  pageName: "Page 2",
                  pageContent: content,
                },
              ],
            },
            {
              chapterId: "2",
              chapterName: "Chapter 2",
              chapterImage: "https://github.com/sekaieth/Publius/blob/main/Publius-Transparent-White.png?raw=true",
              pages: [
                {
                  pageId: "3",
                  pageName: "Page 3",
                  pageContent: content,
                },
                {
                  pageId: "4",
                  pageName: "Page 4",
                  pageContent: content,
                },
              ],
            },
          ],
        },
        {
          sectionId: "2",
          sectionName: "Section 2",
          sectionImage: "",
          chapters: [
            {
              chapterId: "3",
              chapterName: "Chapter 3",
              chapterImage: "",
              pages: [
                {
                  pageId: "5",
                  pageName: "Page 5",
                  pageContent: content,
                },
                {
                  pageId: "6",
                  pageName: "Page 6",
                  pageContent: content,
                },
              ],
            },
            {
              chapterId: "4",
              chapterName: "Chapter 4",
              chapterImage: "",
              pages: [
                {
                  pageId: "7",
                  pageName: "Page 7",
                  pageContent: content,
                },
                {
                  pageId: "8",
                  pageName: "Page 8",
                  pageContent: content,
                },
              ],
            },
          ],
        },
      ],
    };

      encodedSections = ethers.utils.defaultAbiCoder.encode(
          [
            "string",
            "string",
            "uint256",
          ],
          [
            publication.sections[0].sectionName,
            publication.sections[0].sectionImage,
            publication.sections[0].sectionId,
          ]
        ); 

        encodedChapters = ethers.utils.defaultAbiCoder.encode(
          [
              "string[]",
              "string[]", 
              "uint256[]",
          ],
          [
            publication.sections[0].chapters.flatMap(chapter => chapter.chapterName),
            publication.sections[0].chapters.flatMap(chapter => chapter.chapterImage),
            publication.sections[0].chapters.flatMap(chapter => chapter.chapterId),
          ]
        );

        encodedPages = (ethers.utils.defaultAbiCoder.encode(
            [
                "string[][]",
                "string[][]",
                "uint256[][]"
            ],
            [
              publication.sections[0].chapters.map(chapter => chapter.pages.map(page => page.pageName)),
              publication.sections[0].chapters.map(chapter => chapter.pages.map(page => page.pageContent)),
              publication.sections[0].chapters.map(chapter => chapter.pages.map(page => page.pageId)),
            ]
          ));

          await publius.connect(author).addSection(
            encodedSections,
            encodedChapters,
            encodedPages,
          )

    });

    describe("Test Revert Cases", () => {
        it("Should revert if the caller is not the author", async () => {
            await expect(publius.connect(deployer).modifySection(
              publication.sections[0].sectionId,
              publication.sections[0].sectionName,
              publication.sections[0].sectionImage,
            )).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("should revert if the section name is empty", async () => {
            await expect(authorWalletPublius.modifySection(
              publication.sections[0].sectionId,
              "",
              publication.sections[0].sectionImage,
            )).to.be.revertedWith("Publius: New section name cannot be empty");
        });

        it("should revert if the section id is 0", async () => {
            await expect(authorWalletPublius.modifySection(
              0,
              publication.sections[0].sectionName,
              publication.sections[0].sectionImage,
            )).to.be.revertedWith("Publius: Section does not exist");
        });

        it("should revert if the section image is empty", async () => {
            await expect(authorWalletPublius.modifySection(
              publication.sections[0].sectionId,
              publication.sections[0].sectionName,
              "",
            )).to.be.revertedWith("Publius: New section image cannot be empty");
        });
      });

      describe("Test Modify Section", () => {
        it("Should modify the section name", async () => {
            let section = await publius.sections(publication.sections[0].sectionId);
            expect(section.sectionName).to.equal(publication.sections[0].sectionName);
            expect(section.sectionImage).to.equal(publication.sections[0].sectionImage);

            await authorWalletPublius.modifySection(
                publication.sections[0].sectionId,
                "New Section Name",
                publication.sections[0].sectionImage
              );
            section = await publius.sections(publication.sections[0].sectionId);
            expect(section.sectionName).to.equal("New Section Name");
            expect(section.sectionImage).to.equal(publication.sections[0].sectionImage);
        });
      });
});