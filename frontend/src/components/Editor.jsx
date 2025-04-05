import React, { useEffect } from 'react';
import Editor from '@monaco-editor/react';
import socket from '../util/socket';
import { loader } from '@monaco-editor/react';
// import oneDark from 'monaco-themes/themes/One Dark.json';
import dracula from 'monaco-themes/themes/Dracula.json';
import solarizedDark from 'monaco-themes/themes/Solarized-dark.json';

loader.init().then(monaco => {
  // monaco.editor.defineTheme('one-dark', oneDark);
  monaco.editor.defineTheme('dracula', dracula);
  monaco.editor.defineTheme('solarized-dark', solarizedDark);

  monaco.editor.setTheme('solarized-dark'); // or whichever you prefer
})
const CodeEditor = ({ language = 'cpp', value = '', onChange }) => {
    useEffect(() => {
      const handleDefaultCode = (defaultCode) => {
        onChange(defaultCode)
      };
      socket.on('default-code', handleDefaultCode);
    
      return () => {
        socket.off('default-code', handleDefaultCode);
      };
    }, []);

    function changeHandler(val){
      onChange(val || '')
      socket.emit('code-change',val)
    }
  return (
    <div className="w-full h-full border border-gray-700 rounded-xl overflow-hidden scrollbar-none">
      <Editor
        height="100%"
        language={language}
        value={value}
        onChange={(val)=>changeHandler(val)}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  );
};

export default CodeEditor;
