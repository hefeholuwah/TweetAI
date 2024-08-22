const express = require("express");
const pool = require("./db");
const axios = require("axios");
const rateLimit = require("rate-limiter-flexible");
const cron = require("cron");

const app = express();
const PORT = process.env.PORT || 3000;

// Rate Limiter
const rateLimiter = new rateLimit.RateLimiterMemory({
  points: 5, // 5 requests
  duration: 60, // per minute
});

app.use(express.json());

// Endpoint to get Autobots
app.get("/api/autobots", async (req, res) => {
  try {
    await rateLimiter.consume(req.ip);

    const [rows] = await pool.query("SELECT * FROM Autobots LIMIT 10");
    res.json(rows);
  } catch (err) {
    res.status(429).send("Too Many Requests");
  }
});

// Endpoint to get Autobot's posts
app.get("/api/autobot/:id/posts", async (req, res) => {
  try {
    await rateLimiter.consume(req.ip);

    const [rows] = await pool.query(
      "SELECT * FROM Posts WHERE autbot_id = ? LIMIT 10",
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(429).send("Too Many Requests");
  }
});

// Endpoint to get post comments
app.get("/api/post/:id/comments", async (req, res) => {
  try {
    await rateLimiter.consume(req.ip);

    const [rows] = await pool.query(
      "SELECT * FROM Comments WHERE post_id = ? LIMIT 10",
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(429).send("Too Many Requests");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const job = new cron.CronJob("0 * * * *", async () => {
  for (let i = 0; i < 500; i++) {
    const { data: autbot } = await axios.get(
      "https://jsonplaceholder.typicode.com/users"
    );
    const { data: posts } = await axios.get(
      "https://jsonplaceholder.typicode.com/posts"
    );
    const { data: comments } = await axios.get(
      "https://jsonplaceholder.typicode.com/comments"
    );

    const [autobotResult] = await pool.query(
      "INSERT INTO Autobots (name, username, email) VALUES (?, ?, ?)",
      [autbot[i].name, autbot[i].username, autbot[i].email]
    );

    for (let j = 0; j < 10; j++) {
      const [postResult] = await pool.query(
        "INSERT INTO Posts (autbot_id, title, body) VALUES (?, ?, ?)",
        [
          autobotResult.insertId,
          `${posts[i * 10 + j].title}-${Date.now()}`,
          posts[i * 10 + j].body,
        ]
      );

      for (let k = 0; k < 10; k++) {
        await pool.query(
          "INSERT INTO Comments (post_id, name, email, body) VALUES (?, ?, ?, ?)",
          [
            postResult.insertId,
            comments[j * 10 + k].name,
            comments[j * 10 + k].email,
            comments[j * 10 + k].body,
          ]
        );
      }
    }
  }
});

job.start();
