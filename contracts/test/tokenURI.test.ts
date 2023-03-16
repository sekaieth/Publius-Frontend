import { ethers, network, upgrades } from "hardhat";
import { expect } from 'chai';
import { Publius } from '../typechain-types';
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import * as fs from 'fs';
import { 
  Chapter,
  Page,
  Section,
  Publication
} from '../interfaces';



describe("Publius", function () {
  let deployer: SignerWithAddress;
  let author: SignerWithAddress;
  let publius: Publius;
  let sectionToEncode: Section;
  let encodedChapters: string;
  let encodedSection: string;
  let encodedPages: string;

  beforeEach(async function () {
    [deployer, author] = await ethers.getSigners();
    const PubliusFactory = await ethers.getContractFactory('Publius');
    publius = await upgrades.deployProxy(PubliusFactory, [ 
      author.address, 
      'Test Publication', 
      "https://github.com/sekaieth/Publius/blob/main/Publius-Transparent-White.png?raw=true" 
    ]) as Publius;
    await publius.deployed();


      sectionToEncode  = {
        sectionId: 11,
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
    it("should mint a new token", async function () {
        await publius.connect(deployer).mint(3, {value: ethers.utils.parseEther("0.03")})
        expect(await publius.balanceOf(deployer.address)).to.equal(3);
    });

    it("should return the correct token URI", async function () {

        const addSectionTx = await publius.connect(author).addSection(
          encodedSection,
          encodedChapters,
          encodedPages 
        );
        await addSectionTx.wait();

        await publius.connect(deployer).mint(3, {value: ethers.utils.parseEther("0.03")});
        const expectedJSON: Publication = {
          publicationId: 0,
          publicationName: "Test Publication",
          authorName: author.address,
          coverImage: "https://github.com/sekaieth/Publius/blob/main/Publius-Transparent-White.png?raw=true",
          sections: [
            {
              sectionId: sectionToEncode.sectionId,
              sectionName: sectionToEncode.sectionName,
              sectionImage: sectionToEncode.sectionImage,
              chapters: 
                sectionToEncode.chapters.map(chapter => ({
                  chapterId: chapter.chapterId,
                  chapterName: chapter.chapterName,
                  chapterImage: chapter.chapterImage,
                  pages: chapter.pages.map(page => ({
                    pageName: page.pageName,
                    pageContent: page.pageContent,
                    })),
                  })),
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