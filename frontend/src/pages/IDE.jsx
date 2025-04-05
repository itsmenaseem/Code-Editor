import { useEffect, useState } from 'react';
import socket from '../util/socket';
import { useRef } from 'react';
import TerminalComponent from '../components/Terminal';
import CodeEditor from '../components/Editor';
import { useSearchParams } from 'react-router';
function IDE() {
  const [code, setCode] = useState('');
  const [searchParams] = useSearchParams();
  const [language, setLanguage] = useState('cpp');
  useEffect(() => {
    const langFromURL = searchParams.get('lang');
    if (langFromURL) {
      setLanguage(langFromURL);
      console.log(langFromURL);
      socket.emit('language-change',langFromURL)
    }
  }, [searchParams]);
  const Socket = useRef(null)
  const handleRun = () => {
    console.log('Run Code:', code);
    socket.emit('run-command', 'g++ main.cpp -o main && timeout 10s ./main');
    // Send to backend here
  };
  return (
    <div className="flex flex-col h-screen bg-[#0d1117] text-white font-mono">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-gray-700 bg-[#161b22]">
        <h1 className="text-lg font-semibold tracking-wide">🧠 CodePlayground</h1>
        <button
          onClick={handleRun}
          disabled={!socket}
          hidden={!socket}
          className="bg-green-600 hover:bg-green-700 px-4 py-1.5 text-sm rounded-md transition cursor-pointer"
        >
          ▶ Run
        </button>
      </header>

      {/* Editor and Terminal */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Code Editor */}
        <div className="w-full md:w-2/3 h-[60vh] md:h-full p-2">
          <div className="h-full rounded-lg border border-gray-700 overflow-hidden shadow-lg">
            <CodeEditor language={language} value={code} onChange={(val) => setCode(val)} />
          </div>
        </div>

        {/* Terminal */}
        <div className="w-full md:w-1/3 h-[40vh] md:h-full p-2">
          <div className="h-full rounded-lg border border-gray-700 overflow-hidden shadow-inner">
            <TerminalComponent />
          </div>
        </div>
      </div>
    </div>
  );
}

export default IDE;
