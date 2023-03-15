import { ethers, network, upgrades } from "hardhat";
import { expect } from 'chai';
import { Publius } from '../typechain-types';
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import * as fs from 'fs';

interface Page {
    pageId: number;
    pageName: string;
    pageContent: string;
}

interface Chapter {
    chapterId: number;
    chapterName: string;
    chapterImage: string;
    pages: Page[];
}

interface Section {
    sectionId: number;
    sectionName: string;
    sectionImage: string;
    chapters: Chapter[];
}
interface Publication {
    publicationId: number;
    publicationName: string;
    authorName: string;
    coverImage: string;
    sections: Section[];
}

describe("Publius", function () {
  let deployer: SignerWithAddress;
  let author: SignerWithAddress;
  let publius: Publius;

  beforeEach(async function () {
    [deployer, author] = await ethers.getSigners();
    const PubliusFactory = await ethers.getContractFactory('Publius');
    publius = await upgrades.deployProxy(PubliusFactory, [ 
      author.address, 
      'Test Publication', 
      "" 
    ]) as Publius;
    await publius.deployed();
  });

  describe("addSection", function () {
    let sectionName: string;
    let sectionImage: string;
    let chapterNames: string[];
    let chapterImages: string[];
    let pageNames: string[][];
    let pageContents: string[][];

    it("should mint a new token", async function () {
        await publius.connect(deployer).mint(3, {value: ethers.utils.parseEther("0.03")})
    });

    it("should return the correct token URI", async function () {
        sectionName = "Section 1";
        sectionImage = "image1";
        chapterNames = ["Chapter 1", "Chapter 2"];
        chapterImages = ["image2", "image3"];
        pageNames = [["Page 1", "Page 2"], ["Page 3", "Page 4"]];
        pageContents = [["Content 1", "Content 2"], ["Content 3", "Content 4"]];
        let sectionId: number;

        const chapterIds: number[] = [];
        for (let i = 0; i < chapterNames.length; i++) {
        const chapterId = i + 1;
        chapterIds.push(chapterId);
        }

        const chapterInfo = ethers.utils.defaultAbiCoder.encode(
        ["string[]", "string[]", "uint256[]", "string[]", "string[]"],
        [chapterNames, chapterImages, chapterIds, pageNames[0], pageContents[0]]
        );
        
        await publius.connect(author).addSection(sectionName, 0, sectionImage, chapterInfo);
        sectionId = 0;
        const section = await publius.sections(sectionId);
        expect(section.sectionId).to.equal(sectionId);
        expect(section.sectionName).to.equal(sectionName);
        expect(section.sectionImage).to.equal(sectionImage);

        const chapter = await publius.chapters(1);
        expect(chapter.chapterName).to.equal(chapterNames[0]);
        expect(chapter.chapterImage).to.equal(chapterImages[0]);
        expect(chapter.pageCount).to.equal(pageNames[0].length);

        const page = await publius.getPage(1, 1);
        expect(page.pageName).to.equal(pageNames[0][0]);
        expect(page.pageContent).to.equal(pageContents[0][0]);
        await publius.connect(deployer).mint(3, {value: ethers.utils.parseEther("0.03")})
        const expectedJSON: Publication = {
          publicationId: 0,
          publicationName: "",
          authorName: "Thomas Jefferson",
          coverImage: "",
          sections: [
            {
              sectionId: sectionId,
              sectionName: sectionName,
              sectionImage: sectionImage,
              chapters: [
                {
                  chapterId: 1,
                  chapterName: chapterNames[0],
                  chapterImage: chapterImages[0],
                  pages: [
                    {
                      pageId: 1,
                      pageName: pageNames[0][0],
                      pageContent: pageContents[0][0],
                    },
                    {
                      pageId: 2,
                      pageName: pageNames[0][1],
                      pageContent: pageContents[0][1],
                    },
                  ],
                },
                {
                  chapterId: 2,
                  chapterName: chapterNames[1],
                  chapterImage: chapterImages[1],
                  pages: [
                    {
                      pageId: 1,
                      pageName: pageNames[1][0],
                      pageContent: pageContents[1][0],
                    },
                    {
                      pageId: 2,
                      pageName: pageNames[1][1],
                      pageContent: pageContents[1][1],
                    },
                  ],
                },
              ],
            },
          ],
        };
            const tokenURI = await publius.tokenURI(1);
            fs.writeFile('tokenURI.json', tokenURI, function (err) {
                if (err) throw err;
                console.log('Saved!');
                });
            expect(JSON.parse(await publius.tokenURI(1))).to.equal(JSON.stringify(expectedJSON));
        });
    });
});