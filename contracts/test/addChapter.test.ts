import { ethers, network, upgrades } from "hardhat";
import { expect } from 'chai';
import { Publius } from '../typechain-types';
import { Signer } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Publication } from "../interfaces";



describe('Test Adding A Chapter', () => {
  let publius: Publius;
  let signers: SignerWithAddress[];
  let deployer: SignerWithAddress;
  let author: SignerWithAddress;
  let publicationName: string;
  let publicationCoverImage: string;
  let authorWalletPublius: Publius;
  let publication: Publication;


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
  });

  describe("addChapter", function () {

    it("should not allow the owner to add a new chapter if the section does not exist", async function () {
      await expect(
        publius.connect(author).addChapter(
        publication.sections[0].sectionId,
        publication.sections[0].chapters[0].chapterName,
        publication.sections[0].chapters[0].chapterImage,
        publication.sections[0].chapters[0].chapterId,
        publication.sections[0].chapters[0].pages.map((page) => page.pageName),
        publication.sections[0].chapters[0].pages.map((page) => page.pageContent),
        publication.sections[0].chapters[0].pages.map((page) => page.pageId)
      )).to.be.revertedWith("Section does not exist");
    });

    it("should allow the owner to add a new chapter", async function () {
       // Encode data to add section 
        const encodedSections = ethers.utils.defaultAbiCoder.encode(
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

        const encodedChapters = ethers.utils.defaultAbiCoder.encode(
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

        const encodedPages = (ethers.utils.defaultAbiCoder.encode(
            [
                "string[][]",
                "string[][]",
                "string[][]"
            ],
            [
              [publication.sections[0].chapters[0].pages.map(page => page.pageName)],
              [publication.sections[0].chapters[0].pages.map(page => page.pageContent)],
              [publication.sections[0].chapters[0].pages.map(page => page.pageId)]

            ]
          ));
      
      // Add a section
      await publius.connect(author).addSection(
        encodedSections,
        encodedChapters,
        encodedPages
      );

      // Add a chapter
      await publius.connect(author).addChapter(
        publication.sections[0].sectionId,
        publication.sections[0].chapters[1].chapterName,
        publication.sections[0].chapters[1].chapterImage,
        publication.sections[0].chapters[1].chapterId,
        publication.sections[0].chapters[1].pages.map((page) => page.pageName),
        publication.sections[0].chapters[1].pages.map((page) => page.pageContent),
        publication.sections[0].chapters[1].pages.map((page) => page.pageId)
      );

 /* Getting the first chapter of the second section of the publication and then getting each page of
 that chapter. */
      const chapter = await publius.chapters(publication.sections[0].chapters[1].chapterId);
      expect(chapter.chapterName).to.equal(publication.sections[0].chapters[1].chapterName);
      expect(chapter.chapterImage).to.equal(publication.sections[0].chapters[1].chapterImage);
      expect(chapter.pageCount).to.equal(publication.sections[0].chapters[1].pages.length);

      for (let i = 0; i < publication.sections[1].chapters[1].pages.length; i++) {
        const page = await publius.getPage(publication.sections[0].chapters[1].chapterId, i);
        expect(page.pageName).to.equal(publication.sections[0].chapters[1].pages[i].pageName);
        expect(page.pageContent).to.equal(publication.sections[0].chapters[1].pages[i].pageContent);
      }
    });

    it("should not allow a non-owner to add a new chapter", async function () {
      await expect(
      publius.connect(author).addChapter(
        publication.sections[1].sectionId,
        publication.sections[1].chapters[0].chapterName,
        publication.sections[1].chapters[0].chapterImage,
        publication.sections[1].chapters[0].chapterId,
        publication.sections[1].chapters[0].pages.map((page) => page.pageName),
        publication.sections[1].chapters[0].pages.map((page) => page.pageContent),
        publication.sections[1].chapters[0].pages.map((page) => page.pageId)
      )
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
})
