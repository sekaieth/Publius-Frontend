import { ethers, network, upgrades } from "hardhat";
import { expect } from 'chai';
import { Publius } from '../typechain-types';
import { Signer } from "ethers";
import {
    Chapter,
    Page,
    Section,
    Publication
} from '../interfaces';


describe('Test Adding A Section', () => {
  let publius: Publius;
  let author: string;
  let publicationName: string;
  let publicationCoverImage: string;
  let authorWalletPublius: Publius;


  beforeEach(async () => {
    publicationName = 'Test Publication';
    publicationCoverImage = "https://github.com/sekaieth/Publius/blob/main/Publius-Transparent-White.png?raw=true" 
    const signers = await ethers.getSigners();
    author = signers[1].address;
    const PubliusFactory = await ethers.getContractFactory('Publius');
    publius = await upgrades.deployProxy(PubliusFactory, [ 
      author, 
      'Test Publication', 
      publicationCoverImage 
    ]) as Publius;
    await publius.deployed();

    authorWalletPublius = publius.connect(signers[1]);
  });

  describe("addSection", function () {
    it("should not allow a non-owner to add a new section", async function() {
        const chapterNames= ["Test Chapter1", "Test Chapter2"];
        const chapterImages=["https://github.com/sekaieth/Publius/blob/main/Publius-Transparent-White.png?raw=true", "NONE"]
        const chapterIds = [1, 2];
        const pageNames = ["Test Page1", "Test Page2", "Test Page3"];
        const pageContent = ["Test Content1", "Test Content2", "Test Content3"];
        const chapterInfo = ethers.utils.defaultAbiCoder.encode(
            [
            "string[]",
            "string[]",
            "uint256[]",
            "string[]",
            "string[]",
            ],
            [chapterNames, chapterImages, chapterIds, pageNames, pageContent]
        );

        const sectionName = "Test Section";
        const sectionId = 1;
        const sectionImage = "https://github.com/sekaieth/Publius/blob/main/Publius-Transparent-White.png?raw=true";        
        await expect(publius.addSection(
            sectionName,
            sectionId,
            sectionImage,
            chapterInfo
        )).to.be.revertedWith("Ownable: caller is not the owner");
    })
    it("should add a new section", async function () {

      const sectionToEncode: Section = {
        sectionId: 11,
        sectionName: "Section 1",
        sectionImage: "image1",
        chapters: [
          {
            chapterId: 1,
            chapterName: "Chapter 1",
            chapterImage: "image2",
            pages: [{
              pageId: 1,
              pageName: "Page 1",
              pageContent: "Content 1"
            },
            {
              pageId: 2,
              pageName: "Page 2",
              pageContent: "Content 2"
            }]
          },
          {
            chapterId: 2,
            chapterName: "Chapter 2",
            chapterImage: "image3",
            pages: [{
              pageId: 3,
              pageName: "Page 3",
              pageContent: "Content 3"
            },
            {
              pageId: 4,
              pageName: "Page 4",
              pageContent: "Content 4"
            }]
          }
        ]
      };

      const encodedSection = ethers.utils.defaultAbiCoder.encode(
        [
            "string",
            "uint256",
            "string",
            "string[]",
            "string[]",
            "uint256[]",
            "string[]",
            "string[]",
        ],
        [
            sectionToEncode.sectionName,
            sectionToEncode.sectionId,
            sectionToEncode.sectionImage,
            sectionToEncode.chapters.map((chapter: Chapter) => chapter.chapterName),
            sectionToEncode.chapters.map((chapter: Chapter) => chapter.chapterImage),
            sectionToEncode.chapters.map((chapter: Chapter) => chapter.chapterId),
            sectionToEncode.chapters.map((chapter: Chapter) => chapter.pages.map((page: Page) => page.pageName).join(",")),
            sectionToEncode.chapters.map((chapter: Chapter) => chapter.pages.map((page: Page) => page.pageContent).join(",")),
        ] 
        );

        const addSectionTx = await authorWalletPublius.addSection(encodedSection);
        await addSectionTx.wait();

        // Verify Section Information
        const section = await publius.sections(sectionToEncode.sectionId);
        expect(section.sectionName).to.equal(sectionToEncode.sectionName);
        expect(section.sectionId).to.equal(sectionToEncode.sectionId);
        expect(section.sectionImage).to.equal(sectionToEncode.sectionImage);

        // Verify Chapter Information
        const chapter = await publius.chapters(sectionToEncode.chapters[0].chapterId);
        expect(chapter.chapterId).to.equal(sectionToEncode.chapters[0].chapterId);
        expect(chapter.chapterName).to.equal(sectionToEncode.chapters[0].chapterName);
        expect(chapter.chapterImage).to.equal(sectionToEncode.chapters[0].chapterImage);
        expect(chapter.pageCount).to.equal(sectionToEncode.chapters[0].pages.length);
        for (let i = 0; i < sectionToEncode.chapters[0].pages.length; i++) {
            const page = await publius.getPage(sectionToEncode.chapters[0].pages[i].pageId, i + 1);
            expect(page.pageName).to.equal(sectionToEncode.chapters[0].pages[i].pageName);
            expect(page.pageContent).to.equal(sectionToEncode.chapters[0].pages[i].pageContent);
        }
        });
    });
});