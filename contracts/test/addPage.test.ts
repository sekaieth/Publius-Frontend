
import { ethers, network, upgrades } from "hardhat";
import { expect } from 'chai';
import { Publius } from '../typechain-types';
import { Signer } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Publication } from "../interfaces";



describe('Test Adding A Page', () => {
  let publius: Publius;
  let signers: SignerWithAddress[];
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
    const signers = await ethers.getSigners();
    deployer = signers[0];
    author = signers[1];
    const Publius = await ethers.getContractFactory('Publius');
    publius = await upgrades.deployProxy(Publius, [ 
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
          [publication.sections[0].chapters[0].chapterName],
          [publication.sections[0].chapters[0].chapterImage],
          [publication.sections[0].chapters[0].chapterId],
        ]
      );

      encodedPages = (ethers.utils.defaultAbiCoder.encode(
          [
              "string[][]",
              "string[][]",
              "uint256[][]"
          ],
          [
            [publication.sections[0].chapters[0].pages.map(page => page.pageName)],
            [publication.sections[0].chapters[0].pages.map(page => page.pageContent)],
            [publication.sections[0].chapters[0].pages.map(page => page.pageId)]
          ]
        ));
        await publius.connect(author).addSection(
          encodedSections,
          encodedChapters,
          encodedPages
        );
  });

  describe("Test Revert Cases", () => {
    it("Should revert if the sender is not the author of the publication", async () => {
      const pageName = "Page 9";
      const pageContent = "Content 9";
      const pageId = 9;
      await expect(
        publius.connect(deployer).addPage(
          1, 
          pageName,
          pageContent,
          pageId
        )
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should revert if the chapter does not exist", async () => {
      const pageName = "Page 9";
      const pageContent = "Content 9";
      const pageId = 9;
      await expect(
        publius.connect(author).addPage(
          3, 
          pageName,
          pageContent,
          pageId
        )
      ).to.be.revertedWith("Publius: Chapter does not exist");
    });

    it("should revert if page name is empty", async () => {
      const pageName = "";
      const pageContent = "Content 9";
      const pageId = 9;
      await expect(
        publius.connect(author).addPage(
          1,
          pageName,
          pageContent,
          pageId
        )
      ).to.be.revertedWith("Publius: Page name cannot be empty");
    });

    it("should revert if page content is empty", async () => {
      const pageName = "Page 9";
      const pageContent = "";
      const pageId = 9;
      await expect(
        publius.connect(author).addPage(
          1,
          pageName,
          pageContent,
          pageId
        )
      ).to.be.revertedWith("Publius: Page content cannot be empty");
    });

    it("should revert if the page ID is 0", async () => {
      const pageName = "Page 9";
      const pageContent = "Content 9";
      const pageId = 0;
      await expect(
        publius.connect(author).addPage(
          1,
          pageName,
          pageContent,
          pageId
        )
      ).to.be.revertedWith("Publius: Page ID cannot be 0");
    });


    it("should revert if the page already exists", async () => {
      const pageName = "Page 9";
      const pageContent = "Content 9";
      const pageId = 9;

      publius.connect(author).addPage(
        1,
        pageName,
        pageContent,
        pageId
      );

      await expect(
        publius.connect(author).addPage(
          1, 
          pageName,
          pageContent,
          pageId
        )
      ).to.be.revertedWith("Publius: Page already exists");
    });
  });

  describe("Test Adding A Page", () => {
    it("Should add a page", async () => {
      const pageName = "Page 9";
      const pageContent = "Content 9";
      const pageId = 9;
      await publius.connect(author).addPage(
        1, 
        pageName,
        pageContent,
        pageId
      );
      const page = await publius.connect(author).getPage(1, 9);
      expect(page.pageName).to.equal(pageName);
      expect(page.pageContent).to.equal(pageContent);
      expect(page.pageId).to.equal(pageId);
    });
  });
});

    