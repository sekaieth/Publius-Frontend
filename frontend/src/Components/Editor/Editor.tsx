import { $getRoot, $getSelection, EditorState } from 'lexical';
import { useEffect } from 'react';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { TreeView } from '@lexical/react/LexicalTreeView';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import './Editor.css';
import TreeViewPlugin from '../../TreeviewPlugin';
import React from 'react';
import AutoFocusPlugin from '../AutoFocus/AutoFocusPlugin';
import { DateTimePlugin } from '../DateTime/DateTimePlugin';
import { DateTimeNode } from '../DateTime/DateTimeNode';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import PubliusLogo from "../../../../Publius-Transparent-White.png"

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
      <div style={{ display: "flex", justifyContent: "center", marginTop: "3%" }}>
        <ConnectButton />
      </div>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center"}}>
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
