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
import TreeViewPlugin from './TreeviewPlugin';
import React from 'react';
import AutoFocusPlugin from './AutoFocusPlugin';
import { DateTimePlugin } from './DateTimePlugin';
import { DateTimeNode } from './DateTimeNode';

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
  );
};
