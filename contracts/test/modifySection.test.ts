import { ethers, network, upgrades } from "hardhat";
import { expect } from 'chai';
import { Publius } from '../typechain-types';
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


  beforeEach(async () => {
    publicationName = 'Test Publication';
    publicationCoverImage = "https://github.com/sekaieth/Publius/blob/main/Publius-Transparent-White.png?raw=true" 
    const signers: SignerWithAddress[] = await ethers.getSigners();
    deployer = signers[0];
    author = signers[1];
    const PubliusFactory = await ethers.getContractFactory('Publius');
    publius = await upgrades.deployProxy(PubliusFactory, [ 
      author.address,
      'Test Publication', 
      publicationCoverImage 
    ]) as Publius;
    await publius.deployed();

    authorWalletPublius = publius.connect(signers[1]);

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

      await authorWalletPublius.addSection(
          encodedSections, 
          encodedChapters,
          encodedPages
      );
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