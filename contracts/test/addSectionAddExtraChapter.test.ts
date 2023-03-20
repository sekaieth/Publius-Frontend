import { ethers, upgrades } from "hardhat";
import { expect } from 'chai';
import { Publius } from '../typechain-types';
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import * as fs from 'fs';
import { 
  Publication
} from '../interfaces';:webkitURL



describe("Publius", function () {
  let deployer: SignerWithAddress;
  let author: SignerWithAddress;
  let publius: Publius;
  let publication: Publication;
  let encodedChapters: string;
  let encodedSections: string;
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
                "string[][]"
            ],
            [
              publication.sections[0].chapters.map(chapter => chapter.pages.map(page => page.pageName)),
              publication.sections[0].chapters.map(chapter => chapter.pages.map(page => page.pageContent)),
              publication.sections[0].chapters.map(chapter => chapter.pages.map(page => page.pageId)),
            ]
          ));
  });

  describe("addSection", function () {
    it("should mint a new token", async function () {
        await publius.connect(deployer).mint(3, {value: ethers.utils.parseEther("0.03")})
        expect(await publius.balanceOf(deployer.address)).to.equal(3);
    });

    it("should return the correct token URI", async function () {

        const addSectionTx = await publius.connect(author).addSection(
          encodedSections,
          encodedChapters,
          encodedPages,
        );
        await addSectionTx.wait();
        await publius.connect(deployer).mint(3, {value: ethers.utils.parseEther("0.03")});
            const tokenURI = await publius.tokenURI(1);
            fs.writeFile('tokenURI.json', tokenURI, function (err) {
                if (err) throw err;
            });
        expect(JSON.stringify(JSON.parse(await publius.tokenURI(1)))).to.equal(JSON.stringify(publication));
    });

    it("should return the correct token URI after adding a new chapter to an existing section", async function () {
        const addSectionTx = await publius.connect(author).addSection(
          encodedSections,
          encodedChapters,
          encodedPages,
        );
        await addSectionTx.wait();
        await publius.connect(deployer).mint(3, {value: ethers.utils.parseEther("0.03")});
        const encodedNewChapter = ethers.utils.defaultAbiCoder.encode(
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
        const encodedNewPages = (ethers.utils.defaultAbiCoder.encode(
          [
              "string[][]",
              "string[][]",
              "string[][]"
          ],
          [
            publication.sections[0].chapters.map(chapter => chapter.pages.map(page => page.pageName)),
            publication.sections[0].chapters.map(chapter => chapter.pages.map(page => page.pageContent)),
            publication.sections[0].chapters.map(chapter => chapter.pages.map(page => page.pageId)),
          ]
        ));
        const addChapterTx = await publius.connect(author).addChapter(
          1,
          encodedNewChapter,
          encodedNewPages,
        );
        await addChapterTx.wait();
        const tokenURI = await publius.tokenURI(1);
        fs.writeFile('tokenURI.json', tokenURI, function (err) {
            if (err) throw err;
        });
        expect(JSON.stringify(JSON.parse(await publius.tokenURI(1)))).to.equal(JSON.stringify(publication));
    }