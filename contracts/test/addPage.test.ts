
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
    author = signers[1];
    const Publius = await ethers.getContractFactory('Publius');
    publius = await upgrades.deployProxy(Publius, [ 
      author.address, 
      'Test Publication', 
      publicationCoverImage 
    ]) as Publius;
    await publius.deployed();

    authorWalletPublius = publius.connect(signers[1]);
  });
    describe("addPage", function () {
        const chapterId = 1;
        const pageNames = ["Page 1", "Page 2", "Page 3"];
        const pageContent = ["Content 1", "Content 2", "Content 3"];
        let chapter;
        let publiusAuthorConnect;


        it("should not allow the owner to add a new page to a non-existent chapter", async function () {
            const pageName = "Page 4";
            const pageContent = "Content 4";

            await expect(
            publius.connect(author).addPage(chapterId + 1, pageName, pageContent)
            ).to.be.revertedWith("Chapter does not exist");
        });



        it("should allow the owner to add a new page to a chapter", async function () {
            // Add Chapter
            const chapterName = "Chapter 1";
            const chapterImage = "image1";
            const chapterId = 1;
            const pageNames = ["Page 1", "Page 2", "Page 3"];
            const pageContent = ["Content 1", "Content 2", "Content 3"];

            publiusAuthorConnect = publius.connect(author)
            await publiusAuthorConnect.addChapter(chapterName, chapterImage, chapterId, pageNames, pageContent);

            chapter = await publiusAuthorConnect.chapters(chapterId);
            expect(chapter.chapterId).to.equal(chapterId);
            expect(chapter.chapterName).to.equal(chapterName);
            expect(chapter.chapterImage).to.equal(chapterImage);
            expect(chapter.pageCount).to.equal(pageNames.length);

            for (let i = 0; i < pageNames.length; i++) {
                const page = await publiusAuthorConnect.getPage(chapterId, i + 1);
                expect(page.pageName).to.equal(pageNames[i]);
                expect(page.pageContent).to.equal(pageContent[i]);
            }

            // Add Page
            await publiusAuthorConnect.addPage(chapterId, "Page 4", "Content 4");

            chapter = await publiusAuthorConnect.chapters(chapterId);
            expect(chapter.pageCount).to.equal(pageNames.length + 1);

            const page = await publiusAuthorConnect.getPage(chapterId, pageNames.length + 1);
            expect(page.pageName).to.equal("Page 4");
            expect(page.pageContent).to.equal("Content 4");
        });

        it("should not allow a non-owner to add a new page", async function () {
            const pageName = "Page 4";
            const pageContent = "Content 4";

            await expect(
            publius.connect(deployer).addPage(chapterId, pageName, pageContent)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });
});

    