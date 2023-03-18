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
    let sectionToEncode: Section;
    let encodedSection: string; 
    let encodedChapters: string;
    let encodedPages: string;


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

      sectionToEncode  = {
        sectionId: 1,
        sectionName: "Section 1",
        sectionImage: "https://github.com/sekaieth/Publius/blob/main/Publius-Transparent-White.png?raw=true",
        chapters: [
          {
            chapterId: 1,
            chapterName: "Chapter 1",
            chapterImage: "https://github.com/sekaieth/Publius/blob/main/Publius-Transparent-White.png?raw=true",
            pages: [{
              pageName: "Page 1",
              pageContent: "Content 1"
            },
            {
              pageName: "Page 2",
              pageContent: "Content 2"
            }]
          },
          {
            chapterId: 2,
            chapterName: "Chapter 2",
            chapterImage: "https://github.com/sekaieth/Publius/blob/main/Publius-Transparent-White.png?raw=true",
            pages: [{
              pageName: "Page 3",
              pageContent: "Content 3"
            },
            {
              pageName: "Page 4",
              pageContent: "Content 4"
            }]
          }
        ]
      };

    encodedSection = ethers.utils.defaultAbiCoder.encode(
        [
          "string",
          "string",
          "uint256",
        ],
        [
          sectionToEncode.sectionName,
          sectionToEncode.sectionImage,
          sectionToEncode.sectionId,
        ]
    );

    encodedChapters = ethers.utils.defaultAbiCoder.encode(
        [
            "string[]",
            "string[]", 
            "uint256[]",
        ],
        [
            sectionToEncode.chapters.map(chapter => chapter.chapterName),
            sectionToEncode.chapters.map(chapter => chapter.chapterImage),
            sectionToEncode.chapters.map(chapter => chapter.chapterId),
        ]
    );

    encodedPages = ethers.utils.defaultAbiCoder.encode(
        [
            "string[]",
            "string[]",
        ],
        [
            sectionToEncode.chapters.flatMap(chapter => chapter.pages.map(page => page.pageName)),
            sectionToEncode.chapters.flatMap(chapter => chapter.pages.map(page => page.pageContent))
        ]
    );

  });


  describe("addSection", function () {
    it("should not allow a non-owner to add a new section", async function() {
        await expect(publius.addSection(
            encodedSection, 
            encodedChapters,
            encodedPages
        )).to.be.revertedWith("Ownable: caller is not the owner");
    })
    it("should add a new section", async function () {
        const addSectionTx = await authorWalletPublius.addSection(
            encodedSection, 
            encodedChapters,
            encodedPages
        );
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
        expect(chapter.pageCount).to.equal(sectionToEncode.chapters.map(chapter => chapter.pages.length).reduce((a, b) => a + b, 0));

        // Verify Page Information
        for (let i = 0; i < sectionToEncode.chapters[0].pages.length; i++) {
            const page = await publius.getPage(sectionToEncode.chapters[0].chapterId, i + 1);
            expect(page.pageName).to.equal(sectionToEncode.chapters[0].pages[i].pageName);
            expect(page.pageContent).to.equal(sectionToEncode.chapters[0].pages[i].pageContent);
        }
        });
    });
});