const fs = require("fs");
const path = require("path");

const dist = path.join(__dirname, "dist");
fs.mkdirSync(dist, { recursive: true });

const source = `const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
app.get("/", (_req, res) => res.json({ message: "multi-stage runtime", builtAt: "${new Date().toISOString()}" }));
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.listen(port, "0.0.0.0", () => console.log("listening on " + port));
`;

fs.writeFileSync(path.join(dist, "server.js"), source);
console.log("built dist/server.js");
