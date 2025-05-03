import { execSync } from "child_process";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import pty from "node-pty";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import defaultCodes from "./codes/defaultcode.js";
/*
npx y-websocket --port 1234

*/
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const containers = {}; // { roomId: { containerId, ext, defaultCode } }
const rooms = {};      // { roomId: [socketId, ...] }

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const Dir = path.join(__dirname, 'codes');

const startContainer = (id, language) => {
  let defaultCode, image, ext;

  if (language === 'cpp') {
    defaultCode = defaultCodes.cpp;
    image = 'gcc';
    ext = 'cpp';
  } else if (language === 'java') {
    defaultCode = defaultCodes.java;
    image = 'openjdk';
    ext = 'java';
  } else if (language === 'python') {
    defaultCode = defaultCodes.python;
    image = 'python';
    ext = 'py';
  } else {
    console.error('❌ Unsupported language:', language);
    return null;
  }

  const codeDir = path.join(Dir, `${id}`);
  fs.mkdirSync(codeDir, { recursive: true });

  const filePath = path.join(codeDir, `main.${ext}`);
  fs.writeFileSync(filePath, defaultCode);

  try {
    const containerId = execSync(`docker run -dit \
      --cpus=".2" \
      --memory=100m \
      --pids-limit=50 \
      --network none \
      --read-only \
      -v ${codeDir}:/codes \
      ${image}`).toString().trim();

    console.log(`🧱 Started container: ${containerId}`);
    return { containerId, ext, defaultCode };
  } catch (err) {
    console.error('❌ Docker error:', err.message);
    return null;
  }
};

const stopContainer = (containerId) => {
  try {
    execSync(`docker stop ${containerId}`);
    execSync(`docker rm ${containerId}`);
    console.log(`🧹 Removed container: ${containerId}`);
  } catch (err) {
    console.error('❌ Failed to stop container:', err.message);
  }
};

io.on('connection', (socket) => {
  let roomId;
  let shell = null;

  console.log(`⚡ Connected: ${socket.id}`);

  socket.on("language-change", (language, id) => {
    roomId = id;

    if (!rooms[roomId]) {
      rooms[roomId] = [];
      const container = startContainer(roomId, language);
      if (!container) return;
      containers[roomId] = container;
      socket.emit('default-code', container.defaultCode);
    }

    if (!rooms[roomId].includes(socket.id)) {
      rooms[roomId].push(socket.id);
    }

    const { containerId, ext, defaultCode } = containers[roomId];

    shell = pty.spawn('docker', [
      'exec', '-it', containerId,
      'bash', '-c', 'cd /codes && bash'
    ], {
      name: 'xterm-color',
      cols: 80,
      rows: 30,
      env: process.env,
    });

    shell.on('data', (data) => {
      socket.emit('output', data);
    });
  });

  socket.on('run-command', (cmd, code) => {
    const containerInfo = containers[roomId];
    if (!containerInfo || !code) return;

    const { ext, containerId } = containerInfo;
    const codeDir = path.join(Dir, `${roomId}`);
    const filePath = path.join(codeDir, `main.${ext}`);
    fs.writeFileSync(filePath, code);

    if (ext === 'py') cmd = 'python main.py';
    else if (ext === 'java') cmd = 'javac main.java && java main';

    if (shell) shell.write(`${cmd}\r`);
  });

  socket.on('input', (input) => {
    if (shell) shell.write(input);
  });

  socket.on('resize', ({ cols, rows }) => {
    if (shell) shell.resize(cols, rows);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Disconnected: ${socket.id}`);
    if (!roomId || !rooms[roomId]) return;

    const index = rooms[roomId].indexOf(socket.id);
    if (index !== -1) rooms[roomId].splice(index, 1);

    if (rooms[roomId].length === 0) {
      if (shell) shell.kill();
      const codeDir = path.join(Dir, `${roomId}`);
      fs.rmSync(codeDir, { recursive: true, force: true });
      stopContainer(containers[roomId].containerId);
      delete containers[roomId];
      delete rooms[roomId];
    }
  });
});

server.listen(4000, () => {
  console.log('🚀 Server at http://localhost:4000');
});
