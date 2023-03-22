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
      [deployer, author]= await ethers.getSigners();

      // Deploy the implementation contract
      const Publius = await ethers.getContractFactory('Publius');
      const publiusInstance = await Publius.deploy();
      await publiusInstance.deployed();

      // Deploy the factory contract, which will also deploy the Beacon contract
      const PubliusFactory = await ethers.getContractFactory('PubliusFactory');
      factory = await PubliusFactory.deploy(publiusInstance.address) as PubliusFactory;
      await factory.deployed();

      // Deploy the first publication
      const deployPublication = await factory.createPublication(1, author.address, publicationName, publicationCoverImage);
      await deployPublication.wait();

      publius = await ethers.getContractAt('Publius', await factory.getPublicationAddress(1)) as Publius;

    authorWalletPublius = publius.connect(author);

      publication = {
          publicationName: "Test Publication",
          authorName: author.address.toLowerCase(),
          coverImage: "https://github.com/sekaieth/Publius/blob/main/Publius-Transparent-White.png?raw=true",
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
                    pageContent: "Content 1"
                  },
                  {
                  pageId: "2",
                  pageName: "Page 2",
                  pageContent: "Content 2"
                  }
                ]
              },
              {
                chapterId: "2",
                chapterName: "Chapter 2",
                chapterImage: "https://github.com/sekaieth/Publius/blob/main/Publius-Transparent-White.png?raw=true",
                pages: [{
                  pageId: "3",
                  pageName: "Page 3",
                  pageContent: "Content 3"
                },
                {
                  pageId: "4",
                  pageName: "Page 4",
                  pageContent: "Content 4"
                }]
              }
            ]
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
                pages: [{
                  pageId: "5",
                  pageName: "Page 5",
                  pageContent: "Content 5"
                },
                {
                  pageId: "6",
                  pageName: "Page 6",
                  pageContent: "Content 6"
                }
              ]
              },
              {
                chapterId: "4",
                chapterName: "Chapter 4",
                chapterImage: "",
                pages: [{
                  pageId: "7",
                  pageName: "Page 7",
                  pageContent: "Content 7"
                },
                {
                  pageId: "8",
                  pageName: "Page 8",
                  pageContent: "Content 8"
                }
              ]
              }
            ]
            }
          ],
      }

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
  });

  describe("addSection", function () {

    describe("Test Revert Scenarios", function () {
      it("not allow non-author to add a section", async function () {
        await expect(
          publius.connect(deployer).addSection(
            encodedSections,
            encodedChapters,
            encodedPages,
          )).to.be.revertedWith("Ownable: caller is not the owner");
      });

    //   it("reverts if section info is empty", async function () {
    //     await expect(
    //       publius.connect(author).addSection(
    //         ethers.constants.HashZero,
    //         encodedChapters,
    //         encodedPages,
    //       )).to.be.revertedWith("Publius: Section information cannot be empty");
    //   });

    //   it("reverts if chapter info is empty", async function () {
    //     await expect(
    //       publius.connect(author).addSection(
    //         encodedSections,
    //         "",
    //         encodedPages,
    //       )).to.be.revertedWith("Publius: Chapter information cannot be empty");
    //   });

    //   it("reverts if page info is empty", async function () {
    //     await expect(
    //       publius.connect(author).addSection(
    //         encodedSections,
    //         encodedChapters,
    //         "",
    //       )).to.be.revertedWith("Publius: Page information cannot be empty");
    //   });
    });

    describe("Test Adding A Section", function () {
      it("author adds a section", async function () {

          const addSectionTx = await publius.connect(author).addSection(
            encodedSections,
            encodedChapters,
            encodedPages,
          );
          await addSectionTx.wait();

          // Verify Section Information
          const section = await publius.sections(publication.sections[0].sectionId);
          expect(section.sectionName).to.equal(publication.sections[0].sectionName);
          expect(section.sectionId).to.equal(publication.sections[0].sectionId);
          expect(section.sectionImage).to.equal(publication.sections[0].sectionImage);



          // Verify Chapter Information
          const chapter = await publius.chapters(publication.sections[0].chapters[0].chapterId);
          const chapterIds = await publius.getPageIds(chapter.chapterId); 
          expect(chapter.chapterId).to.equal(publication.sections[0].chapters[0].chapterId);
          expect(chapter.chapterName).to.equal(publication.sections[0].chapters[0].chapterName);
          expect(chapter.chapterImage).to.equal(publication.sections[0].chapters[0].chapterImage);
          expect(chapterIds.length).to.equal(publication.sections[0].chapters[0].pages.length);

          // Verify Page Information
          for (let i = 1; i < chapterIds.length; i++) {
            const page = await publius.getPage(chapter.chapterId, publication.sections[0].chapters[0].pages[i].pageId);
            expect(page.pageName).to.equal(publication.sections[0].chapters[0].pages[i].pageName);
            expect(page.pageContent).to.equal(publication.sections[0].chapters[0].pages[i].pageContent);
          }
          });
      });
    });
});