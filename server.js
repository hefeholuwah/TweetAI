const express = require("express");
const pool = require("./db");
const axios = require("axios");
const rateLimit = require("rate-limiter-flexible");
const cron = require("cron");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

const app = express();
const PORT = process.env.PORT || 3000;

// Rate Limiter
const rateLimiter = new rateLimit.RateLimiterMemory({
  points: 5, // 5 requests
  duration: 60, // per minute
});

app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Endpoint to get Autobots

/**
 * @swagger
 * /api/autobots:
 *   get:
 *     summary: Retrieve a list of Autobots
 *     description: Retrieve a list of Autobots, limited to 10 results per request.
 *     responses:
 *       200:
 *         description: A list of Autobots
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The Autobot ID
 *                     example: 1
 *                   name:
 *                     type: string
 *                     description: The name of the Autobot
 *                     example: Optimus Prime
 *                   username:
 *                     type: string
 *                     description: The username of the Autobot
 *                     example: optimusprime
 *                   email:
 *                     type: string
 *                     description: The email of the Autobot
 *                     example: optimus@cybertron.com
 */
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
/**
 * @swagger
 * /api/autobot/{id}/posts:
 *   get:
 *     summary: Retrieve posts for a specific Autobot
 *     description: Retrieve a list of posts created by a specific Autobot, limited to 10 results per request.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the Autobot
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The post ID
 *                     example: 101
 *                   autbot_id:
 *                     type: integer
 *                     description: The ID of the Autobot who created the post
 *                     example: 1
 *                   title:
 *                     type: string
 *                     description: The title of the post
 *                     example: "Why I Love Cybertron"
 *                   body:
 *                     type: string
 *                     description: The body content of the post
 *                     example: "Cybertron is my home and I will protect it at all costs."
 */
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
/**
 * @swagger
 * /api/post/{id}/comments:
 *   get:
 *     summary: Retrieve comments for a specific post
 *     description: Retrieve a list of comments for a specific post, limited to 10 results per request.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the post
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The comment ID
 *                     example: 501
 *                   post_id:
 *                     type: integer
 *                     description: The ID of the post the comment belongs to
 *                     example: 101
 *                   name:
 *                     type: string
 *                     description: The name of the comment author
 *                     example: Bumblebee
 *                   email:
 *                     type: string
 *                     description: The email of the comment author
 *                     example: bumblebee@autobots.com
 *                   body:
 *                     type: string
 *                     description: The content of the comment
 *                     example: "I totally agree with you!"
 */
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
  console.log(
    `Swagger docs available at https://tweetai.onrender.com/api-docs`
  );
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
