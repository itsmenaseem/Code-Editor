import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import socket from '../util/socket';
import 'xterm/css/xterm.css';

const TerminalComponent = () => {
  const terminalRef = useRef(null);
  const xterm = useRef(null);
  const fitAddon = useRef(null);

  useEffect(() => {
    xterm.current = new Terminal({
      scrollback: 1000,
      cursorBlink: true,
      fontSize: 14,
      theme: {
        background: '#282a36',
        foreground: '#f8f8f2',
        cursor: '#f8f8f2',
        selection: '#44475a',
        black: '#21222c',
        red: '#ff5555',
        green: '#50fa7b',
        yellow: '#f1fa8c',
        blue: '#bd93f9',
        magenta: '#ff79c6',
        cyan: '#8be9fd',
        white: '#f8f8f2',
        brightBlack: '#6272a4',
        brightRed: '#ff6e6e',
        brightGreen: '#69ff94',
        brightYellow: '#ffffa5',
        brightBlue: '#d6acff',
        brightMagenta: '#ff92df',
        brightCyan: '#a4ffff',
        brightWhite: '#ffffff',
      },
    });

    fitAddon.current = new FitAddon();
    xterm.current.loadAddon(fitAddon.current);
    xterm.current.open(terminalRef.current);
    fitAddon.current.fit();
    xterm.current.focus();

    // Send input to backend
    xterm.current.onData((data) => {
      if (data.trim() === 'clear') {
        xterm.current.reset();
      } else {
        socket.emit('input', data);
      }
    });

    // Receive output from backend
    const handleOutput = (data) => xterm.current.write(data);
    socket.on('output', handleOutput);

    // Terminal resizing
    xterm.current.onResize(({ cols, rows }) =>
      socket.emit('resize', { cols, rows })
    );

    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => fitAddon.current.fit(), 100);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      socket.off('output', handleOutput);
      xterm.current.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden">
      <div ref={terminalRef} className="w-full h-full pl-1" />
    </div>
  );
};

export default TerminalComponent;
