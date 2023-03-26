import { $getRoot, $getSelection, EditorState } from 'lexical';
import { useEffect, MouseEvent } from 'react';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';

import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import './Editor.css';
import TreeViewPlugin from '../../Plugins/Treeview/TreeviewPlugin';
import React from 'react';
import AutoFocusPlugin from '../../Plugins/AutoFocus/AutoFocusPlugin';
import { DateTimePlugin } from '../../Plugins/DateTime/DateTimePlugin';
import { DateTimeNode } from '../../Nodes/DateTimeNode/DateTimeNode';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import PubliusLogo from "../../../Assets/Publius-Transparent-White.png"

// WAGMI Hooks
import { useAccount } from "wagmi";
import { useNavigate } from 'react-router-dom';

const theme = {
  // Theme styling goes here
  // ...
};

// When the editor changes, you can get notified via the
// LexicalOnChangePlugin!
function onChange(editorState: EditorState) {
  editorState.read(() => {
    // Read the contents of the EditorState here.
    const root = $getRoot();
    const selection = $getSelection();

    console.log(root, selection);
  });
}

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error: Error) {
  console.error(error);
}

export function Editor() {

  const navigate = useNavigate();
  const { address, isDisconnected } = useAccount();

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    console.log(window.location.href = '/Reader');
  }
  const initialConfig = {
    namespace: 'MyEditor',
    theme,
    onError,
    nodes: [
      DateTimeNode
    ]
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "3%", flexDirection: "column" }}>
        <ConnectButton />
        { address && !isDisconnected && <button onClick={() => navigate("/Reader")}>Read a Publication</button> }
      </div>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
        <img src={PubliusLogo}></img>
      </div>
    <LexicalComposer initialConfig={initialConfig}>
      <section className='editor-container'>
      <DateTimePlugin date= {new Date()}/>
        <section className='editor-inner'> <PlainTextPlugin
        contentEditable={<ContentEditable className='editor-input'/>}
        placeholder={<div className='editor-placeholder'>Enter some text</div>}
        ErrorBoundary={LexicalErrorBoundary}
        />
      <OnChangePlugin onChange={onChange} />
      <HistoryPlugin />
      <AutoFocusPlugin />
      <TreeViewPlugin/>
      
        </section>
      </section>
    </LexicalComposer>
    </>
  );
};
