import { ethers } from "hardhat";
import { Publius, PubliusFactory } from '../typechain-types';
import { Publication } from '../interfaces';

async function addChapter() {
    const content = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce vehicula consectetur orci quis convallis. Nulla malesuada pharetra metus, eu porttitor nulla malesuada nec. In et eleifend dolor. Praesent convallis est id tortor aliquam malesuada. Sed venenatis eros vel tortor vehicula, non dignissim augue sodales. Proin vitae justo mauris. Sed ullamcorper tincidunt diam, quis eleifend nisi bibendum id. Nunc vel dolor vitae enim porttitor bibendum.
    Pellentesque sed turpis bibendum, pretium lacus vel, consequat justo. Vivamus suscipit, ipsum quis finibus iaculis, sapien sapien pharetra sapien, vitae facilisis turpis felis vel lorem. Praesent nec elit ante. Sed interdum, nisl sed luctus malesuada, justo lorem sollicitudin dolor, id aliquet sapien magna non ipsum. Vestibulum congue lobortis nibh, ac ullamcorper velit bibendum eget. Ut ut lacus quam. Nullam gravida ultricies ante, ac bibendum nisi ultricies eu. Integer lobortis euismod metus, vel lacinia odio bibendum ac. Donec eleifend magna at mauris ullamcorper, quis cursus justo molestie. Nam consequat risus sit amet nulla aliquam malesuada. Proin aliquam arcu a arcu pellentesque, quis semper massa commodo.
    Praesent id commodo tortor. Nulla porttitor, ex vel fringilla euismod, nulla nisi facilisis lorem, eu cursus justo magna ut metus. Donec nec orci in ex suscipit bibendum. Morbi at pharetra velit. Aliquam aliquam libero vel ligula maximus congue. Sed id ipsum id lectus malesuada sagittis. Duis dignissim dolor ut ipsum laoreet venenatis. Suspendisse finibus non velit eget ultricies. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; In malesuada, metus a bibendum eleifend, quam lorem hendrerit dolor, id varius tellus nisi ut augue. Donec malesuada purus quis elit egestas luctus. Nunc eget interdum metus, quis dapibus velit. Sed vitae nunc quis elit consectetur pretium. Donec bibendum arcu ac est finibus, et viverra dolor vestibulum. Sed vel urna massa.` 

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
                chapterId: "5",
                chapterName: "Chapter 1",
                chapterImage: "https://github.com/sekaieth/Publius/blob/main/Publius-Transparent-White.png?raw=true",
                pages: [
                  {
                    pageId: "1",
                    pageName: "Page 9",
                    pageContent: content 
                  },
                  {
                  pageId: "2",
                  pageName: "Page 10",
                  pageContent: content 
                  }
                ]
              }
          ],
      }
    ]
    }
    const [author] = await ethers.getSigners();
    const publius = await ethers.getContractAt('Publius', '0x9f1ac54BEF0DD2f6f3462EA0fa94fC62300d3a8e', author) as Publius;
    const addChapter = await publius.addChapter(
        publication.sections[0].sectionId,
        publication.sections[0].chapters[0].chapterName,
        publication.sections[0].chapters[0].chapterImage,
        publication.sections[0].chapters[0].chapterId,
        publication.sections[0].chapters[0].pages.map(page => page.pageName),
        publication.sections[0].chapters[0].pages.map(page => page.pageContent),
        publication.sections[0].chapters[0].pages.map(page => page.pageId)
    );
    addChapter.wait();
    console.log("Added a new chapter!");

}

addChapter();