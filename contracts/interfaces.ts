export interface Page {
    pageId: number;
    pageName: string;
    pageContent: string;
}

export interface Chapter {
    chapterId: number;
    chapterName: string;
    chapterImage: string;
    pages: Page[];
}

export interface Section {
    sectionId: number;
    sectionName: string;
    sectionImage: string;
    chapters: Chapter[];
}
export interface Publication {
    publicationId: number;
    publicationName: string;
    authorName: string;
    coverImage: string;
    sections: Section[];
}