import React, { useEffect } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';
import socket from '../util/socket';

const CollaborativeEditor = ({ roomId = 'room-1', language = 'cpp', editorRef }) => {
  const providerRef = React.useRef(null);
  const ydocRef = React.useRef(null);

  useEffect(() => {
    loader.init().then(monaco => {
      monaco.editor.setTheme('vs-dark');
    });

    socket.emit('language-change', language, roomId); // ask for default code

    socket.on('default-code', (code) => {
      const model = editorRef.current?.getModel();
      if (model) model.setValue(code);
    });

    return () => {
      if (providerRef.current) providerRef.current.destroy();
      if (ydocRef.current) ydocRef.current.destroy();
      socket.off('default-code');
    };
  }, [language, roomId]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    const provider = new WebsocketProvider('ws://16.170.252.145:1234', roomId, ydoc);
    providerRef.current = provider;

    const yText = ydoc.getText('monaco');
    const model = editor.getModel();
    if (!model) return;

    new MonacoBinding(yText, model, new Set([editor]), provider.awareness);

    provider.on('status', (event) => {
      console.log('WebSocket connection status:', event.status);
    });
  };

  return (
    <div className="w-full h-full border border-gray-700 rounded-xl overflow-hidden">
      <Editor
        height="100%"
        language={language}
        onMount={handleEditorDidMount}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  );
};

export default CollaborativeEditor;
