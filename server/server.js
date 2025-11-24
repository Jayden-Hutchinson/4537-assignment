require("dotenv/config");

const Database = require("./src/js/database");
const auth = require("./src/js/authentication");

const jwt = require("jsonwebtoken");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const http = require("http");
const express = require("express");
const { hostname } = require("os");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const app = express();

// Use provided PORT or fallback for local development
const PORT = process.env.PORT || 3000;
const BASE_URL = "/COMP4537/assignment/server";
const NGROK_URL = "https://mistral4537.ngrok.app";

const database = new Database();

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "4537 Assignment Server API",
      version: "1.0.0",
      description: "API server for COMP4537 assignment to track user usage and analyze images",
    },
    servers: [
      {
        url: `https://j-hutchinson.com/COMP4537/assignment/server`,
        description: "Development server",
      },
    ],
  },
  apis: ["./server.js"], // Path to the API routes file
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use(`${BASE_URL}/doc`, swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// initialize database connection
(async () => {
  await database.init(
    process.env.DB_HOST,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    process.env.DB_NAME,
    process.env.DB_PORT
  );
})();

// Do not apply authentication globally — keep login public and protect routes explicitly.
// The `auth` module exported a middleware function (authenticateToken).

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// Parse JSON bodies
app.use(express.json());

// Recording middleware: try to decode token (if present) to attribute requests to users
app.use(async (req, res, next) => {
  try {
    // Only attribute and persist usage for authenticated users (token Bearer)
    const authHeader = req.headers.authorization || "";
    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const email = payload.email || payload.id || null;
        if (email) {
          // persist usage event
          try {
            await database.insertUsage(email, req.method, req.path);
            // Check total usage and signal quota exceeded when >= 20
            const userUsage = await database.getUserUsage(email);
            if (userUsage.total >= 20) {
              res.setHeader("X-Quota-Exceeded", "true");
              // also expose on locals for routes that wish to include it in JSON
              res.locals.quotaExceeded = true;
            }
          } catch (e) {
            console.error("Failed to persist usage:", e.message);
          }
        }
      } catch (e) {
        // token invalid — ignore attribution
      }
    }
  } catch (e) {
    console.error("Stats middleware error:", e.message);
  }
  next();
});

// PUBLIC ROUTES
app.get(`${BASE_URL}/`, (req, res) => {
  res.send("Server Running...");
});

app.post(`${BASE_URL}/signup_user`, async (req, res) => {
  const { email, password } = req.body || {};

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password.trim(), saltRounds);

  try {
    await database.insertUser(email, hashedPassword);

    const payload = { email: email, role: "user" };
    const secret = process.env.ACCESS_TOKEN_SECRET;
    const token = jwt.sign(payload, secret, { expiresIn: "1h" });

    console.log(`[server] ${email} Logged in`);
    return res.json({ accessToken: token });
  } catch (err) {
    switch (err.errno) {
      case 1062:
        console.log(
          `[server] An account already exists with the email ${email}`
        );
        return res
          .status(500)
          .json({ error: `An account already exists with the same email` });
      default:
        console.log(err);
        return res.status(500).json({ error: `Unknown Error` });
    }
  }
});

// Login route: checks credentials and returns a signed JWT
/**
 * @swagger
 * /login_user:
 *   post:
 *     summary: Login a user and receive an access token
 *     description: Authenticate user with email and password to receive a JWT access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: mypassword123
 *           example:
 *             email: user@example.com
 *             password: mypassword123
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *             example:
 *               accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Missing email or password
 *       401:
 *         description: Incorrect password
 *       500:
 *         description: Server error
 */
app.post(`${BASE_URL}/login_user`, async (req, res) => {
  const { email, password } = req.body || {};
  console.log(`[server] Logging in ${email}`);

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  try {
    const user = await database.selectUserByEmail(email);

    if (!user) {
      res.status(500).json({ error: "Error getting user from database" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log(`[server] User Found email: ${user.email} role: ${user.role}`);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Incorrect Password" });
    }

    // Create JWT payload (keep it small)
    const payload = { id: user.id, email: user.email, role: user.role };
    const secret = process.env.ACCESS_TOKEN_SECRET;
    const token = jwt.sign(payload, secret, { expiresIn: "1h" });

    console.log(`[server] ${email} Logged in`);
    return res.json({ accessToken: token });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Example protected route (use this pattern for routes that must be authenticated)
/**
 * @swagger
 * /api/protected:
 *   get:
 *     summary: Example protected route
 *     description: Access protected data with a valid JWT access token
 *     responses:
 *       200:
 *         description: Successful access to protected data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       500:
 *         description: Server error
 */
app.get(`${BASE_URL}/api/protected`, auth, (req, res) => {
  // `auth` sets req.user when token is valid
  res.json({ message: "Protected data", user: req.user });
});

app.post(`${BASE_URL}/api/analyze-image`, auth, async (req, res) => {
  const { image } = req.body || {};

  console.log(image);

  const headers = { "Content-Type": "application/json" };

  const request = {
    method: "POST",
    headers,
    body: JSON.stringify({ image: image }),
  };

  const url = `${NGROK_URL}/analyze`;
  const response = await fetch(url, request);

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 413) {
      throw new Error("Image still too large — try a smaller photo");
    }
    throw new Error(`Server error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  console.log(data);
  res.json(data);
  console.log(response);
});

// Admin stats endpoints
// Return counts per endpoint
/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get API endpoint usage statistics
 *     description: Returns the number of requests made to each API endpoint
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   method:
 *                     type: string
 *                   endpoint:
 *                     type: string
 *                   requests:
 *                     type: integer
 *       403:
 *         description: Forbidden - admin access required
 *       500:
 *         description: Server error
 */
app.get(`${BASE_URL}/api/admin/stats`, auth, async (req, res) => {
  // only admin role allowed
  if (!req.user || req.user.role !== "admin")
    return res.status(403).json({ error: "Forbidden" });

  try {
    const rows = await database.getEndpointStats();
    // rows already have method, endpoint, requests
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch endpoint stats" });
  }
});

// Return per-user usage summary
/**
 * @swagger
 * /api/admin/user-usage:
 *   get:
 *     summary: Get user API usage summary
 *     description: Returns a summary of API usage per user
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   username:
 *                     type: string
 *                   email:
 *                     type: string
 *                   totalRequests:
 *                     type: integer
 *       403:
 *         description: Forbidden - admin access required
 *       500:
 *         description: Server error
 */
app.get(`${BASE_URL}/api/admin/user-usage`, auth, async (req, res) => {
  if (!req.user || req.user.role !== "admin")
    return res.status(403).json({ error: "Forbidden" });
  try {
    const rows = await database.getUserUsageSummary();
    const users = rows.map((r) => ({
      username: (r.email || "").split("@")[0],
      email: r.email,
      totalRequests: r.totalRequests,
    }));
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch user usage" });
  }
});

// Return usage for the authenticated user
/**
 * @swagger
 * /api/user/usage:
 *   get:
 *     summary: Get authenticated user's API usage
 *     description: Returns the API usage summary for the authenticated user
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 perEndpoint:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       method:
 *                         type: string
 *                       endpoint:
 *                         type: string
 *                       count:
 *                         type: integer
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       500:
 *         description: Server error
 */
app.get(`${BASE_URL}/api/user/usage`, auth, async (req, res) => {
  const email = req.user && req.user.email ? req.user.email : null;
  if (!email)
    return res.status(400).json({ error: "User email not found in token" });
  try {
    const data = await database.getUserUsage(email);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch user usage" });
  }
});

app.listen(PORT, () => {
  console.log(`[server] Server running at http://localhost:${PORT}`);
});
