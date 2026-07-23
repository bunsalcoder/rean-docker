const express = require("express");

const app = express();
const port = process.env.PORT || 3000;
const version = process.env.APP_VERSION || "local";

app.get("/", (_req, res) => {
  res.json({
    service: "rean-deploy-api",
    env: process.env.NODE_ENV || "development",
    version,
  });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", version });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`listening on ${port} version=${version}`);
});
