import { useEffect, useState, useRef } from 'react';
import socket from '../util/socket';
import TerminalComponent from '../components/Terminal';
import CollaborativeEditor from '../components/Collabartion';
import { useSearchParams } from 'react-router';

function IDE() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [copied, setCopied] = useState(false);
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('roomId') || 'default-room';
  const editorRef = useRef(null); // 🔧 Fix: defined here

  useEffect(() => {
    const langFromURL = searchParams.get('lang');
    if (langFromURL) {
      setLanguage(langFromURL);
      socket.emit('language-change', langFromURL, roomId);
    }
  }, [searchParams]);

  const handleRun = () => {
    const code = editorRef.current?.getValue(); // 🔧 Fixed access
    if (!code) return;
    const cmd =
      language === 'cpp'
        ? 'g++ main.cpp && ./a.out'
        : language === 'python'
        ? 'python main.py'
        : 'javac main.java && java main';

    socket.emit('run-command', cmd, code); // send to backend
  };

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0d1117] text-white font-mono">
      {/* Top Bar */}
      <header className="flex flex-wrap items-center justify-between px-6 py-3 border-b border-gray-700 bg-[#161b22] gap-2">
        <h1 className="text-lg font-semibold tracking-wide">🧠 CodePlayground</h1>

        <div className="flex items-center gap-2 text-sm">
          <span className="bg-gray-700 px-3 py-1 rounded-full text-white">
            Room ID: {roomId}
          </span>
          <button
            onClick={handleCopyRoomId}
            className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded-md transition cursor-pointer"
          >
            {copied ? '✅ Copied' : '📋 Copy'}
          </button>
          <button
            onClick={handleRun}
            className="bg-green-600 hover:bg-green-700 px-4 py-1.5 rounded-md transition cursor-pointer"
          >
            ▶ Run
          </button>
        </div>
      </header>

      {/* Editor and Terminal */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Code Editor */}
        <div className="w-full md:w-2/3 h-[60vh] md:h-full p-2">
          <div className="h-full rounded-lg border border-gray-700 overflow-hidden shadow-lg">
            <CollaborativeEditor
              language={language}
              value={code}
              onChange={setCode}
              roomId={roomId}
              editorRef={editorRef} // 🔧 Pass ref here
            />
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
