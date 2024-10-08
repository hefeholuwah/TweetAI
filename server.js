const express = require("express");
const pool = require("./db");
const axios = require("axios");
const rateLimit = require("rate-limiter-flexible");
const cron = require("cron");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: "https://tweet-ai-counter-3ed3z6l7u-hefeholuwahs-projects.vercel.app", // Replace with your frontend's URL
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
};

app.use(cors(corsOptions));

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
 *     summary: Get all Autobots
 *     description: Retrieve a list of all Autobots with complete details.
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
 *                   name:
 *                     type: string
 *                   username:
 *                     type: string
 *                   email:
 *                     type: string
 *                   address:
 *                     type: object
 *                     properties:
 *                       street:
 *                         type: string
 *                       suite:
 *                         type: string
 *                       city:
 *                         type: string
 *                       zipcode:
 *                         type: string
 *                       geo:
 *                         type: object
 *                         properties:
 *                           lat:
 *                             type: string
 *                           lng:
 *                             type: string
 *                   phone:
 *                     type: string
 *                   website:
 *                     type: string
 *                   company:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       catchPhrase:
 *                         type: string
 *                       bs:
 *                         type: string
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
 *                   userId:
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
      "SELECT * FROM Posts WHERE autobot_id = ? LIMIT 10",
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

/**
 * @swagger
 * /api/autobots/count:
 *   get:
 *     summary: Get the total count of Autobots
 *     description: Retrieve the total number of Autobots in the database.
 *     responses:
 *       200:
 *         description: A count of Autobots
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   description: The total number of Autobots
 *                   example: 5000
 */
app.get("/api/autobots/count", async (req, res) => {
  try {
    const [result] = await pool.execute(
      "SELECT COUNT(*) AS count FROM Autobots"
    );
    const count = result[0].count;
    res.json({ count });
  } catch (err) {
    console.error("Error retrieving Autobot count:", err);
    res.status(500).json({ error: "Failed to retrieve Autobot count" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});

const job = new cron.CronJob("0 * * * *", async () => {
  try {
    const fetchLimit = 500; // Fetch and insert only 100 records at a time to reduce load
    for (let i = 0; i < fetchLimit; i++) {
      const { data: autobots } = await axios.get(
        "https://jsonplaceholder.typicode.com/users"
      );
      const { data: posts } = await axios.get(
        "https://jsonplaceholder.typicode.com/posts"
      );
      const { data: comments } = await axios.get(
        "https://jsonplaceholder.typicode.com/comments"
      );

      // Check if Autobot already exists to prevent duplicate data
      const [existingAutobot] = await pool.query(
        "SELECT id FROM Autobots WHERE email = ?",
        [autobots[i].email]
      );

      let autobotId;
      if (existingAutobot.length > 0) {
        autobotId = existingAutobot[0].id; // Use the existing Autobot ID
      } else {
        const [autobotResult] = await pool.query(
          "INSERT INTO Autobots (name, username, email) VALUES (?, ?, ?)",
          [autobots[i].name, autobots[i].username, autobots[i].email]
        );
        autobotId = autobotResult.insertId;
      }

      for (let j = 0; j < 10; j++) {
        const postTitle = `${posts[i * 10 + j].title}-${Date.now()}`;

        // Check if Post already exists to prevent duplicate data
        const [existingPost] = await pool.query(
          "SELECT id FROM Posts WHERE autobot_id = ? AND title = ?",
          [autobotId, postTitle]
        );

        let postId;
        if (existingPost.length > 0) {
          postId = existingPost[0].id; // Use the existing Post ID
        } else {
          const [postResult] = await pool.query(
            "INSERT INTO Posts (autobot_id, title, body) VALUES (?, ?, ?)",
            [autobotId, postTitle, posts[i * 10 + j].body]
          );
          postId = postResult.insertId;
        }

        for (let k = 0; k < 10; k++) {
          const commentBody = comments[j * 10 + k].body;

          // Check if Comment already exists to prevent duplicate data
          const [existingComment] = await pool.query(
            "SELECT id FROM Comments WHERE post_id = ? AND body = ?",
            [postId, commentBody]
          );

          if (existingComment.length === 0) {
            await pool.query(
              "INSERT INTO Comments (post_id, name, email, body) VALUES (?, ?, ?, ?)",
              [
                postId,
                comments[j * 10 + k].name,
                comments[j * 10 + k].email,
                commentBody,
              ]
            );
          }
        }
      }
    }
  } catch (err) {
    console.error("Error in cron job:", err);
  }
});

job.start();
