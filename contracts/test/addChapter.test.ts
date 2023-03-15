import { ethers, network, upgrades } from "hardhat";
import { expect } from 'chai';
import { Publius } from '../typechain-types';
import { Signer } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";



describe('Test Adding A Chapter', () => {
  let publius: Publius;
  let signers: SignerWithAddress[];
  let deployer: SignerWithAddress;
  let author: SignerWithAddress;
  let publicationName: string;
  let publicationCoverImage: string;
  let authorWalletPublius: Publius;


  beforeEach(async () => {
    publicationName = 'Test Publication';
    publicationCoverImage = "https://github.com/sekaieth/Publius/blob/main/Publius-Transparent-White.png?raw=true" 
    const signers = await ethers.getSigners();
    deployer = signers[0];
    author = signers[1];:webkitURL
    const Publius = await ethers.getContractFactory('Publius');
    publius = await upgrades.deployProxy(Publius, [ 
      author.address, 
      'Test Publication', 
      publicationCoverImage 
    ]) as Publius;
    await publius.deployed();

    authorWalletPublius = publius.connect(signers[1]);
  });

  describe("addChapter", function () {
    it("should allow the owner to add a new chapter", async function () {
      const chapterName = "Chapter 1";
      const chapterImage = "image1";
      const chapterId = 1;
      const pageNames = ["Page 1", "Page 2", "Page 3"];
      const pageContent = ["Content 1", "Content 2", "Content 3"];

      await publius.connect(author).addChapter(chapterName, chapterImage, chapterId, pageNames, pageContent);

      const chapter = await publius.chapters(chapterId);
      expect(chapter.chapterName).to.equal(chapterName);
      expect(chapter.chapterImage).to.equal(chapterImage);
      expect(chapter.pageCount).to.equal(pageNames.length);

      for (let i = 0; i < pageNames.length; i++) {
        const page = await publius.getPage(chapterId, i + 1);
        expect(page.pageName).to.equal(pageNames[i]);
        expect(page.pageContent).to.equal(pageContent[i]);
      }
    });

    it("should not allow a non-owner to add a new chapter", async function () {
      const chapterName = "Chapter 1";
      const chapterImage = "image1";
      const chapterId = 1;
      const pageNames = ["Page 1", "Page 2", "Page 3"];
      const pageContent = ["Content 1", "Content 2", "Content 3"];

      await expect(
        publius.connect(deployer).addChapter(chapterName, chapterImage, chapterId, pageNames, pageContent)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});
