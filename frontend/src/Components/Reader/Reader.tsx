import React, { useState } from "react";
import "./Reader.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import PubliusLogo from "../../../../Publius-Transparent-White.png";
import { 
    Publication, 
    Section,
    Chapter,
    Page,
} from '../../types';
import ReactMarkdown from 'react-markdown';

export const Reader = () => {
    const [selectedSection, setSelectedSection] = useState<Section>();
    const [selectedChapter, setSelectedChapter] = useState<Chapter>();
    const [selectedPage, setSelectedPage] = useState<Page>();

    function handleSectionClick(section: Section) {
        setSelectedSection(section);
        setSelectedChapter(undefined);
        setSelectedPage(undefined);
    }

    function handleChapterClick(chapter: Chapter) {
        setSelectedChapter(chapter);
        setSelectedPage(undefined);
    }

    function handlePageClick(page: Page) {
        setSelectedPage(page);
    }

    function toggleCollapse(event: React.MouseEvent<HTMLsectionElement>) {
        const content = (event.currentTarget as HTMLElement).nextElementSibling as HTMLElement;
        content.style.display = content.style.display === "block" ? "none" : "block";
    }

        const publication: Publication = {
        name: "My Publication",
        author: "John Doe",
        image: "https://example.com/publication.jpg",
        sections: [
            {
            sectionId: "section1",
            sectionName: "Section 1",
            sectionImage: "https://example.com/section1.jpg",
            chapters: [
                {
                chapterId: "chapter1",
                chapterName: "Chapter 1",
                chapterImage: "https://example.com/chapter1.jpg",
                pages: [
                    {
                    pageId: "page1",
                    pageName: "Page 1",
                    pageContent: "## Chapter 1, Page 1\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Duis eget nisi ac nunc commodo semper a sit amet elit. Sed commodo elit euismod, commodo quam vitae, placerat risus. Sed quis velit ligula. Fusce quis ligula nec dolor vestibulum ullamcorper. Donec commodo sodales malesuada."
                    },
                    {
                    pageId: "page2",
                    pageName: "Page 2",
                    pageContent: "## Chapter 1, Page 2\n\nMauris nec lacinia elit. Fusce et lacinia quam. Fusce id metus libero. Proin suscipit justo in est semper, at ultricies turpis vehicula. Praesent bibendum ex vitae arcu hendrerit varius. Aliquam a nunc congue, lobortis massa vel, tincidunt sapien. Sed quis euismod quam."
                    }
                ]
                },
                {
                chapterId: "chapter2",
                chapterName: "Chapter 2",
                chapterImage: "https://example.com/chapter2.jpg",
                pages: [
                    {
                    pageId: "page3",
                    pageName: "Page 3",
                    pageContent: "## Chapter 2, Page 1\n\nSed ultrices finibus enim, non imperdiet metus molestie non. Nullam at eleifend eros. Pellentesque in bibendum nulla. In vel placerat lacus. Suspendisse convallis blandit malesuada. Sed eget sapien bibendum, faucibus metus in, tempor magna."
                    },
                    {
                    pageId: "page4",
                    pageName: "Page 4",
                    pageContent: "## Chapter 2, Page 2\n\nAenean dapibus, mauris quis aliquam bibendum, massa felis vehicula orci, in ullamcorper elit elit id libero. Nam a fringilla elit. Donec placerat imperdiet tortor, nec lobortis est auctor vel. Fusce eget neque varius, tempor lorem eget, egestas nisl. In eget sapien eu felis varius imperdiet."
                    }
                ]
                }
            ]
            },
            {
            sectionId: "section2",
            sectionName: "Section 2",
            sectionImage: "https://example.com/section2.jpg",
            chapters: [
                {
                chapterId: "chapter3",
                chapterName: "Chapter 3",
                chapterImage: "https://example.com/chapter3.jpg",
                pages: [
                    {
                    pageId: "page5",
                    pageName: "Page 5",
                    pageContent: "## Chapter 3, Page 1\n\nAliquam eget quam eu ex luctus elementum. Aliquam quis"
                    }]
                }]
            }]
        }

  return (
    <>
      <section className="readerContainer">
        <ConnectButton />
        <img src={PubliusLogo}></img>
        <section className="readerBox">
          <section className="readerHeader">
          </section>
          <section className="readerContent">
            <section className="readerSidebar">
                <ul>
                {publication.sections.map((section) => (
                    <li key={section.sectionId} className="section">
                    <section className="collapsible" onClick={toggleCollapse}>
                        <h3>{section.sectionName}</h3>
                    </section>
                    <section className="content">
                        <ul>
                        {section.chapters.map((chapter) => (
                            <li key={chapter.chapterId} className="chapter">
                            <section className="collapsible" onClick={toggleCollapse}>
                                <h4>{chapter.chapterName}</h4>
                            </section>
                            <section className="content">
                                <ul>
                                {chapter.pages.map((page) => (
                                    <li key={page.pageId} className="page">
                                    <a href="#" onClick={() => handlePageClick(page)}>
                                        {page.pageName}
                                    </a>
                                    </li>
                                ))}
                                </ul>
                            </section>
                            </li>
                        ))}
                        </ul>
                    </section>
                    </li>
                ))}
                </ul>
            </section>
            <section className="readerBody">
              {selectedPage ? (
                <section className="pageContent">
                  <ReactMarkdown>{selectedPage.pageContent}</ReactMarkdown>
                </section>
              ) : (
                    <section style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%"}}>
                        Select a page from the table of contents to read it.
                    </section>
              )}
            </section>
          </section>
        </section>
      </section>
    </>
  );
};
