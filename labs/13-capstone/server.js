const express = require("express");
const { Pool } = require("pg");
const { createClient } = require("redis");

const app = express();
const port = process.env.PORT || 3000;
const databaseUrl = process.env.DATABASE_URL;
const redisUrl = process.env.REDIS_URL;

if (!databaseUrl || !redisUrl) {
  console.error("DATABASE_URL and REDIS_URL are required (copy .env.example → .env)");
  process.exit(1);
}

const pool = new Pool({ connectionString: databaseUrl });
const redis = createClient({ url: redisUrl });

redis.on("error", (err) => console.error("redis error", err));

async function waitForDeps(retries = 30) {
  for (let i = 1; i <= retries; i++) {
    try {
      if (!redis.isOpen) await redis.connect();
      await redis.ping();
      await pool.query("SELECT 1");
      console.log("dependencies ready");
      return;
    } catch (err) {
      console.log(`waiting for deps (${i}/${retries}): ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error("dependencies not ready in time");
}

app.get("/", async (_req, res) => {
  try {
    const hits = await redis.incr("hits");
    const { rows } = await pool.query("SELECT NOW() as now");
    res.json({
      message: "Capstone API is up — make this endpoint yours",
      hits,
      dbTime: rows[0].now,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CAPSTONE_OWN: add a route that is clearly yours (name, payload, or behavior),
// then document how to curl it in this lab's README.

app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    await redis.ping();
    res.json({ status: "ok" });
  } catch (err) {
    res.status(503).json({ status: "degraded", error: err.message });
  }
});

waitForDeps()
  .then(() => {
    app.listen(port, "0.0.0.0", () => console.log(`listening on ${port}`));
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
