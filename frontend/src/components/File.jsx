import React, { useState } from "react";
import FileTree from "react-file-tree";

const initialFiles = {
  "/src": {
    "/components": {
      "Header.js": null,
      "Footer.js": null,
    },
    "App.js": null,
    "index.js": null,
  },
  "/public": {
    "index.html": null,
  },
};

const FileExplorer = () => {
  const [files, setFiles] = useState(initialFiles);

  return (
    <div style={{ width: "250px", background: "#f5f5f5", padding: "10px" }}>
      <FileTree files={files} />
    </div>
  );
};

export default FileExplorer;
