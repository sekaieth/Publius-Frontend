import React from "react";
import "./Reader.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export const Reader = () => {
    return (
        <>
            <section className="readerContainer">
                <ConnectButton />
                <section className="readerBox">
                    <section className="readerHeader">
                        <h1>Reader</h1>
                    </section>
                    <section style={{ display: "flex" }}>
                        <section className="readerSidebar">
                            <h2>Table of Contents</h2>
                            <ul>
                                <li>
                                    <a href="#section1">Section 1</a>
                                </li>
                                <li>
                                    <a href="#section2">Section 2</a>
                                </li>
                            </ul>
                        </section>
                        <section className="readerBody">
                            <p>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                                euismod, nisl nec ultricies lacinia, nunc nisl aliquet nisl, a
                                tincidunt nunc nisl eget nisl. Nullam auctor, nisl eget
                                tincidunt lacinia, nunc nisl aliquet nisl, a tincidunt nunc
                                nisl eget nisl. Nullam auctor, nisl eget tincidunt lacinia,
                                nunc nisl aliquet nisl, a tincidunt nunc nisl eget nisl.
                            </p>
                        </section>
                    </section>
                </section>
            </section>
        </>
    );
};