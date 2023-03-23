import { ethers } from "hardhat";
import { Publication } from '../interfaces';

async function addSection() {
    const content =  "# Lorem Ipsum **Lorem ipsum dolor sit amet**, _consectetur adipiscing elit_. ## Integer et Molestie Proin `sed ullamcorper` orci: ```javascript let aenean = 'hendrerit'; const curabitur = 'mauris'; ``` ## Imperdiet et Consectetur Phasellus `vestibulum`: ```javascript function loremIpsum(nunc) { return `Vivamus eu: ${nunc}`; } ``` Nulla facilisi, sed `do eiusmod tempor incididunt` ut labore et dolore magna aliqua.";

    const publication: Publication = {
      name: "Test Publication",
      author: "sekaieth",
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

      const encodedSections = ethers.utils.defaultAbiCoder.encode(
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

        const encodedChapters = ethers.utils.defaultAbiCoder.encode(
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

        const encodedPages = (ethers.utils.defaultAbiCoder.encode(
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

    const [author] = await ethers.getSigners();
    const publius = await ethers.getContractAt('Publius', '0x9f1ac54BEF0DD2f6f3462EA0fa94fC62300d3a8e', author);
    const addSection = await publius.addSection(
        encodedSections,
        encodedChapters,
        encodedPages
    );

    addSection.wait();
}


addSection();