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

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const containers = {}; // { socketId: { containerId, ext } }
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
      --memory=256m \
      --pids-limit=50 \
      --network none \
      --read-only \
      -v ${codeDir}:/codes \
      ${image}
    `).toString().trim();

    if(!containerId){
        console.log("not created");
        
        return null;
    }
    console.log(`🧱 Started container: ${containerId}`);
    return { containerId, ext, defaultCode };
  } catch (err) {
    console.error('❌ Failed to start Docker container:', err.message);
    return null;
  }
};

const stopContainer = (containerId) => {
  try {
    execSync(`docker stop ${containerId}`);
    execSync(`docker rm ${containerId}`);
    console.log(`🧹 Stopped and removed container: ${containerId}`);
  } catch (err) {
    console.error(`❌ Error stopping container: ${err.message}`);
  }
};

io.on('connection', (socket) => {
  console.log(`⚡ User connected: ${socket.id}`);
  let shell = null;

  socket.on("language-change", (language) => {
    if (containers[socket.id]) {
      if (shell) {
        shell.kill();
        shell = null;
      }
      const codeDir = path.join(Dir, `${socket.id}`);
      fs.rmSync(codeDir, { recursive: true, force: true });
      stopContainer(containers[socket.id].containerId);
      delete containers[socket.id];
    }

    const container = startContainer(socket.id, language);
    if (!container) return;

    const { containerId, ext, defaultCode } = container;
    containers[socket.id] = { containerId, ext };

    socket.emit('default-code', defaultCode);

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

  socket.on('run-command', (cmd) => {
    const {ext} = containers[socket.id]
    if(ext ==='py'){ 
        cmd = 'timeout 10s python main.py'
    }
    else if(ext === 'java'){
        cmd = 'timeout 10s java main.java'
    }
    if (shell) shell.write(`${cmd}\r`);
  });

  socket.on('input', (input) => {
    if (shell) shell.write(input);
  });

  socket.on('resize', ({ cols, rows }) => {
    if (shell) shell.resize(cols, rows);
  });

  socket.on("code-change", (code) => {
    const containerInfo = containers[socket.id];
    if (!containerInfo) return;
    const { ext } = containerInfo;
    const codeDir = path.join(Dir, `${socket.id}`);
    const filePath = path.join(codeDir, `main.${ext}`);
    fs.writeFileSync(filePath, code);
  });

  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
    if (containers[socket.id]) {
      if (shell) shell.kill();
      const codeDir = path.join(Dir, `${socket.id}`);
      fs.rmSync(codeDir, { recursive: true, force: true });
      stopContainer(containers[socket.id].containerId);
      delete containers[socket.id];
    }
  });
});

server.listen(4000, () => {
  console.log('🚀 Server running at http://localhost:4000');
});
