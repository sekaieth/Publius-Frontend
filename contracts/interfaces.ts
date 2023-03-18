export interface Page {
    pageId: string;
    pageName: string;
    pageContent: string;
}

export interface Chapter {
    chapterId: string;
    chapterName: string;
    chapterImage: string;
    pages: Page[];
}

export interface Section {
    sectionId: string;
    sectionName: string;
    sectionImage: string;
    chapters: Chapter[];
}
export interface Publication {
    publicationName: string;
    authorName: string;
    coverImage: string;
    sections: Section[];
}