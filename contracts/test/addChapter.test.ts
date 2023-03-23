import { ethers, network, upgrades } from "hardhat";
import { expect } from 'chai';
import { Publius, PubliusFactory } from '../typechain-types';
import { Signer } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Chapter, Publication } from "../interfaces";



describe('Test Adding A Chapter', () => {
  let deployer: SignerWithAddress;
  let author: SignerWithAddress;
  let publius: Publius;
  let publication: Publication;
  let encodedChapters: string;
  let encodedSections: string;
  let encodedPages: string; 
  let factory: PubliusFactory;
  let publicationName: string;
  let publicationCoverImage: string;

  beforeEach(async function () {
    [deployer, author] = await ethers.getSigners();
    // Deploy the implementation contract
    const Publius = await ethers.getContractFactory('Publius');
    const publiusInstance = await Publius.deploy();
    await publiusInstance.deployed();

    // Deploy the factory contract, which will also deploy the Beacon contract
    const PubliusFactory = await ethers.getContractFactory('PubliusFactory');
    factory = await PubliusFactory.deploy(publiusInstance.address);
    await factory.deployed();

    // Deploy the first publication
    publicationName = "Test Publication";
    publicationCoverImage = "https://github.com/sekaieth/Publius/blob/main/Publius-Transparent-White.png?raw=true";


    const deployPublication = await factory.createPublication(1, author.address, "s3kai.eth", publicationName, publicationCoverImage);
    await deployPublication.wait();

    publius = await ethers.getContractAt('Publius', await factory.getPublicationAddress(1)) as Publius;
    const content = "# Title\\nThis is a **bold** and *italic* text. ## Code Box\\n```javascript\\nlet a = 1;\\nlet b = 2;\\n```\\n## List\\n- Item 1\\n- Item 2\\n- Item 3\\n## Link\\n[Google](https://google.com)\\n## Image\\n![Publius]()"
    const expectedContent = "# Title\nThis is a **bold** and *italic* text. ## Code Box\n```javascript\nlet a = 1;\nlet b = 2;\n```\n## List\n- Item 1\n- Item 2\n- Item 3\n## Link\n[Google](https://google.com)\n## Image\n![Publius]()"

    publication= {
      name: "Test Publication",
      author: "s3kai.eth",
      image: "https://github.com/sekaieth/Publius/blob/main/Publius-Transparent-White.png?raw=true",
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
                  pageContent: content,
                },
                {
                  pageId: "2",
                  pageName: "Page 2",
                  pageContent: content,
                },
              ],
            },
            {
              chapterId: "2",
              chapterName: "Chapter 2",
              chapterImage: "https://github.com/sekaieth/Publius/blob/main/Publius-Transparent-White.png?raw=true",
              pages: [
                {
                  pageId: "3",
                  pageName: "Page 3",
                  pageContent: content,
                },
                {
                  pageId: "4",
                  pageName: "Page 4",
                  pageContent: content,
                },
              ],
            },
          ],
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
              pages: [
                {
                  pageId: "5",
                  pageName: "Page 5",
                  pageContent: content,
                },
                {
                  pageId: "6",
                  pageName: "Page 6",
                  pageContent: content,
                },
              ],
            },
            {
              chapterId: "4",
              chapterName: "Chapter 4",
              chapterImage: "",
              pages: [
                {
                  pageId: "7",
                  pageName: "Page 7",
                  pageContent: content,
                },
                {
                  pageId: "8",
                  pageName: "Page 8",
                  pageContent: content,
                },
              ],
            },
          ],
        },
      ],
    };

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
            publication.sections[0].chapters.map(chapter => chapter.chapterName),
            publication.sections[0].chapters.map(chapter => chapter.chapterImage),
            publication.sections[0].chapters.map(chapter => chapter.chapterId),
          ]
        );

        encodedPages = (ethers.utils.defaultAbiCoder.encode(
            [
                "string[][]",
                "string[][]",
                "uint256[][]"
            ],
            [
              publication.sections[0].chapters.map(chapter => chapter.pages.map(page => page.pageName)),
              publication.sections[0].chapters.map(chapter => chapter.pages.map(page => page.pageContent)),
              publication.sections[0].chapters.map(chapter => chapter.pages.map(page => page.pageId)),
            ]
          ));

          await publius.connect(author).addSection(
            encodedSections,
            encodedChapters,
            encodedPages,
          )
  });

  describe("addChapter", function () {

    describe("Test reverts", function () {

      it("should not allow a non-owner to add a new chapter", async function () {
        await expect(
        publius.connect(deployer).addChapter(
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

      it("should not allow the owner to add a new chapter if the section does not exist", async function () {
        await expect(
          publius.connect(author).addChapter(
          publication.sections[1].sectionId,
          publication.sections[1].chapters[0].chapterName,
          publication.sections[1].chapters[0].chapterImage,
          publication.sections[1].chapters[0].chapterId,
          publication.sections[1].chapters[0].pages.map((page) => page.pageName),
          publication.sections[1].chapters[0].pages.map((page) => page.pageContent),
          publication.sections[1].chapters[0].pages.map((page) => page.pageId)
        )).to.be.revertedWith("Publius: Section does not exist");
      });

      it("should not allow the owner to add a new chapter if the chapter already exists", async function () {
        await expect(
          publius.connect(author).addChapter(
          publication.sections[0].sectionId,
          publication.sections[0].chapters[0].chapterName,
          publication.sections[0].chapters[0].chapterImage,
          publication.sections[0].chapters[0].chapterId,
          publication.sections[0].chapters[0].pages.map((page) => page.pageName),
          publication.sections[0].chapters[0].pages.map((page) => page.pageContent),
          publication.sections[0].chapters[0].pages.map((page) => page.pageId)
        )).to.be.revertedWith("Publius: Chapter already exists");
      });

      it("should not allow the owner to add a new chapter if the chapter id is 0", async function () {
        await expect(
          publius.connect(author).addChapter(
          publication.sections[0].sectionId,
          publication.sections[0].chapters[0].chapterName,
          publication.sections[0].chapters[0].chapterImage,
          "0",
          publication.sections[0].chapters[0].pages.map((page) => page.pageName),
          publication.sections[0].chapters[0].pages.map((page) => page.pageContent),
          publication.sections[0].chapters[0].pages.map((page) => page.pageId)
        )).to.be.revertedWith("Publius: Chapter ID cannot be 0");
      });


      it("should not allow the owner to add a new chapter if the chapter name is empty", async function () {

        await expect(
          publius.connect(author).addChapter(
          publication.sections[0].sectionId,
          "",
          publication.sections[0].chapters[1].chapterImage,
          publication.sections[0].chapters[1].chapterId,
          publication.sections[0].chapters[1].pages.map((page) => page.pageName),
          publication.sections[0].chapters[1].pages.map((page) => page.pageContent),
          publication.sections[0].chapters[1].pages.map((page) => page.pageId)
        )).to.be.revertedWith("Publius: Chapter name cannot be empty");
      });

      it("should not allow the owner to add a new chapter if the page names array is empty", async function () {
        await expect(
          publius.connect(author).addChapter(
          publication.sections[0].sectionId,
          publication.sections[0].chapters[1].chapterName,
          publication.sections[0].chapters[1].chapterImage,
          publication.sections[0].chapters[1].chapterId,
          [],
          publication.sections[0].chapters[1].pages.map((page) => page.pageContent),
          publication.sections[0].chapters[1].pages.map((page) => page.pageId)
        )).to.be.revertedWith("Publius: Page names cannot be empty");
      });

      it("should not allow the owner to add a new chapter if the page IDs array is empty", async function () {
        await expect(
          publius.connect(author).addChapter(
          publication.sections[0].sectionId,
          publication.sections[0].chapters[1].chapterName,
          publication.sections[0].chapters[1].chapterImage,
          publication.sections[0].chapters[1].chapterId,
          publication.sections[0].chapters[1].pages.map((page) => page.pageName),
          publication.sections[0].chapters[1].pages.map((page) => page.pageContent),
          []
        )).to.be.revertedWith("Publius: Page IDs cannot be empty");
      });

      it("should not allow the owner to add a new chapter if the page contents array is empty", async function () {
        await expect(
          publius.connect(author).addChapter(
          publication.sections[0].sectionId,
          publication.sections[0].chapters[1].chapterName,
          publication.sections[0].chapters[1].chapterImage,
          publication.sections[0].chapters[1].chapterId,
          publication.sections[0].chapters[1].pages.map((page) => page.pageName),
          [],
          publication.sections[0].chapters[1].pages.map((page) => page.pageId)
        )).to.be.revertedWith("Publius: Page content cannot be empty");
      });

      it("should not allow the owner to add a new chapter if the page names array is not the same length as the page IDs array", async function () {
        await expect(
          publius.connect(author).addChapter(
          publication.sections[0].sectionId,
          publication.sections[0].chapters[1].chapterName,
          publication.sections[0].chapters[1].chapterImage,
          publication.sections[0].chapters[1].chapterId,
          publication.sections[0].chapters[1].pages.map((page) => page.pageName),
          ["test", "test", "test", "test", "test"],
          publication.sections[0].chapters[1].pages.map((page) => page.pageId)
        )).to.be.revertedWith("Publius: Page names and content must be the same length");
    });
  });

    describe("Test Successful Chapter Addition", function () {
      it("should allow the owner to add a new chapter", async function () {
        const newChapter: Chapter = {
          chapterId: "5",
          chapterName: "Chapter 5",
          chapterImage: "",
          pages: [
            {
              pageId: "20",
              pageName: "Page 20",
              pageContent: "Page 20 Content",
            },  
            {
              pageId: "21",
              pageName: "Page 21",
              pageContent: "Page 21 Content",
            }
          ]
        };
        // Add a chapter
        const sendChapter = await publius.connect(author).addChapter(
          publication.sections[0].sectionId,
          newChapter.chapterName,
          newChapter.chapterImage,
          newChapter.chapterId,
          newChapter.pages.map((page) => page.pageName),
          newChapter.pages.map((page) => page.pageContent),
          newChapter.pages.map((page) => page.pageId)
          );
        sendChapter.wait();

  /* Getting the first chapter of the second section of the publication and then getting each page of
  that chapter. */


        const chapter = await publius.chapters(newChapter.chapterId)
        expect(chapter.chapterId).to.equal(newChapter.chapterId);
        expect(chapter.chapterName).to.equal(newChapter.chapterName);
        expect(chapter.chapterImage).to.equal(newChapter.chapterImage);

        for (let i = 1; i < publication.sections[0].chapters[1].pages.length; i++) {
          const page = (await publius.getPage(newChapter.chapterId, newChapter.pages[i].pageId));
          expect(page.pageName).to.equal(newChapter.pages[i].pageName);
          expect(page.pageContent).to.equal(newChapter.pages[i].pageContent);
        }
      });
    });
  });
});
