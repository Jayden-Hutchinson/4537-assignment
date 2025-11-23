require("dotenv/config");

const Database = require("./src/js/database");
const auth = require("./src/js/authentication");

const jwt = require("jsonwebtoken");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const http = require("http");
const express = require("express");
const { hostname } = require("os");

const app = express();

// Use provided PORT or fallback for local development
const PORT = process.env.PORT || 3000;
const BASE_URL = "/COMP4537/assignment/server";

const database = new Database();

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
app.get(`${BASE_URL}/api/protected`, auth, (req, res) => {
  // `auth` sets req.user when token is valid
  res.json({ message: "Protected data", user: req.user });
});

app.post(`${BASE_URL}/api/blip/analyze-image`, auth, async (req, res) => {
  const { image } = req.body || {};

  if (!image) {
    return res.status(400).json({ error: "Image data required " });
  }

  try {
    const data = JSON.stringify({ image });

    const options = {
      hostname: "localhost",
      port: 5000,
      path: "/analyze",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": data.length,
      },
    };

    const request = http.request(options, (response) => {
      let body = "";
      response.on("data", (chunk) => (body += chunk));
      response.on("end", () => {
        try {
          const json = JSON.parse(body);
          res.json({ caption: json.caption, description: json.description });
        } catch (e) {
          res.status(500).json({
            error: "Failed to parse BLIP response",
            details: e.message,
          });
        }
      });
    });

    request.on("error", (err) => {
      res
        .status(500)
        .json({ error: "BLIP service unavailable", details: err.message });
    });

    request.write(data);
    request.end();
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

// Admin stats endpoints
// Return counts per endpoint
app.get(`${BASE_URL}/api/admin/stats`, auth, async (req, res) => {
  // only admin role allowed
  if (!req.user || req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });

  try {
    const rows = await database.getEndpointStats();
    // rows already have method, endpoint, requests
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch endpoint stats" });
  }
});

// Return per-user usage summary
app.get(`${BASE_URL}/api/admin/user-usage`, auth, async (req, res) => {
  if (!req.user || req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
  try {
    const rows = await database.getUserUsageSummary();
    const users = rows.map((r) => ({ username: (r.email || "").split("@")[0], email: r.email, totalRequests: r.totalRequests }));
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch user usage" });
  }
});

// Return usage for the authenticated user
app.get(`${BASE_URL}/api/user/usage`, auth, async (req, res) => {
  const email = req.user && req.user.email ? req.user.email : null;
  if (!email) return res.status(400).json({ error: "User email not found in token" });
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
