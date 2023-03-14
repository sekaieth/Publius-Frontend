import { ethers, network, upgrades } from "hardhat";
import { expect } from 'chai';
import { Publius } from '../typechain-types';
import { Signer } from "ethers";



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
    const Publius = await ethers.getContractFactory('Publius');
    publius = await upgrades.deployProxy(Publius, [ 
      author, 
      'Test Publication', 
      publicationCoverImage 
    ]) as Publius;
    await publius.deployed();

    authorWalletPublius = publius.connect(signers[1]);
  });

  describe("addSection", function () {
    it("should add a new section", async function () {
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
        const addSectionTx = await authorWalletPublius.addSection(
            sectionName,
            sectionId,
            sectionImage,
            chapterInfo
        );
        await addSectionTx.wait();
        // Verify Section Information
        const section = await publius.sections(sectionId);
        expect(section.sectionName).to.equal(sectionName);
        expect(section.sectionId).to.equal(sectionId);
        expect(section.sectionImage).to.equal(sectionImage);
        const chapter = await publius.chapters(chapterIds[0]);
        expect(chapter.chapterId).to.equal(chapterIds[0]);
        expect(chapter.chapterName).to.equal(chapterNames[0]);
        expect(chapter.chapterImage).to.equal(chapterImages[0]);
        expect(chapter.pageCount).to.equal(pageNames.length);
        for (let i = 0; i < pageNames.length; i++) {
            const page = await publius.getPage(chapterIds[0], i + 1);
            expect(page.pageName).to.equal(pageNames[i]);
            expect(page.pageContent).to.equal(pageContent[i]);
        }
        });
    });
});