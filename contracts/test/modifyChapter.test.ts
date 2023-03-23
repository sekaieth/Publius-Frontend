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

    describe("Test Revert Cases", () => {

        it("Should revert if the caller is not the author", async () => {
            await expect(
                publius.connect(deployer).modifyChapter(
                    publication.sections[0].chapters[0].chapterId,
                    "Chapter 1",
                    "https://github.com/sekaieth/Publius/blob/main/Publius-Transparent-White.png?raw=true",
                )
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should revert if the chapter does not exist", async () => {
            await expect(
                publius.connect(author).modifyChapter(
                    "5",
                    "Chapter 1",
                    "https://testurl.com",
                )
            ).to.be.revertedWith("Publius: Chapter does not exist");
        });

        it("Should revert if the chapter name is empty", async () => {
            await expect(
                publius.connect(author).modifyChapter(
                    publication.sections[0].chapters[0].chapterId,
                    "",
                    "https://testurl.com",
                )
            ).to.be.revertedWith("Publius: New chapter name cannot be empty");
        });
        
        it("Should revert if the chapter image is empty", async () => {
            await expect(
                publius.connect(author).modifyChapter(
                    publication.sections[0].chapters[0].chapterId,
                    "Chapter 1",
                    "",
                )
            ).to.be.revertedWith("Publius: New chapter image cannot be empty");
        });
    });

    describe("Test Modify Chapter", () => {
            
        it("Should modify the chapter name", async () => {
            let chapter = await publius.chapters(publication.sections[0].chapters[0].chapterId);
            expect(chapter.chapterName).to.equal(publication.sections[0].chapters[0].chapterName);
            expect(chapter.chapterImage).to.equal(publication.sections[0].chapters[0].chapterImage);

            await publius.connect(author).modifyChapter(
                publication.sections[0].chapters[0].chapterId,
                "Chapter 1",
                "https://testurl.com",
            );

            chapter = await publius.chapters(publication.sections[0].chapters[0].chapterId);
            expect(chapter.chapterName).to.equal("Chapter 1");
            expect(chapter.chapterImage).to.equal("https://testurl.com");   
        });
    });
});