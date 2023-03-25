import React, { useState, useEffect } from "react";
import "./Reader.css";
import { ethers } from "ethers";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useContractRead, useAccount, useNetwork } from "wagmi";
import { usePubliusTokenUri } from "../../generated"
import PubliusLogo from "../../../../Publius-Transparent-White.png";
import { Publius__factory } from "../../../../contracts/typechain-types";
import hardhatAddresses from "../../../../contracts/hardhat-contract-info.json";
import scrollAddresses from "../../../../contracts/scroll-contract-info.json";
import { 
    Publication, 
    Section,
    Chapter,
    Page,
} from '../../types';
import ReactMarkdown from 'react-markdown';

export const Reader = () => {
    const [selectedPage, setSelectedPage] = useState<Page>();
    const [publication, setPublication] = useState<Publication>();

    const { address, isDisconnected } = useAccount();
    const { chain, chains } = useNetwork();

    const hardhatPublius = hardhatAddresses.Publius.address.substring(2);
    const scrollPublius = scrollAddresses.Publius.address.substring(2);

    const { data, isError, error } = usePubliusTokenUri ({
        address: `0x${scrollPublius}`,
        args: [ethers.BigNumber.from(1)],
    });

    function handlePageClick(page: Page) {
        setSelectedPage(page);
    }

    function toggleCollapse(event: React.MouseEvent) {
        const content = (event.currentTarget as HTMLElement).nextElementSibling as HTMLElement;
        content.style.display = content.style.display === "block" ? "none" : "block";
    }

    useEffect(() => {
        if (data) {
            const encodedPublication = data.substring(29);
            const decodedB64 = atob(encodedPublication);
            const json = JSON.parse(decodedB64);
            setPublication(json);
        }
    }, [data]);

    if(isDisconnected) {
        return (
            <section className="readerContainer">
                <ConnectButton />
                <img src={PubliusLogo}></img>
                <section className="readerBoxBig">
                    <h1>Please connect your wallet to continue</h1>
                </section>
            </section>
        )
    } 
    if(isError) {
        return (
              <section className="readerContainer">
                <ConnectButton />
                <img src={PubliusLogo}></img>
                <section className="readerBoxBig">
                    <h1>There was an error loading the publication</h1>
                    {error && error.message}         
                </section>
            </section>
        )
    }
    else return (
      <section className="readerContainer">
        <ConnectButton />
        <img src={PubliusLogo}></img>
        <section className="readerBox">
          <section className="readerHeader">
            {
                address && publication && ( 
                <>
                    <h1 >{publication?.name}</h1>
                    Select a page from the table of contents to read it.
                </>
                )
            }
          </section>
          <section className="readerContent">
            <section className="readerSidebar">
                <ul>
                {address && publication && publication.sections.map((section) => (
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
              {selectedPage && (
                <section className="pageContent">
                  <ReactMarkdown>{selectedPage.pageContent}</ReactMarkdown>
                </section>
              )} 
            </section>
          </section>
        </section>
      </section>
  );
};
