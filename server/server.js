require("dotenv/config");

const Database = require("./src/js/database");
const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
const auth = require("./authentication");

const env = process.env;

// Use provided PORT or fallback for local development
const PORT = env.PORT || 4537;

const database = new Database(
  env.DB_HOST,
  env.DB_USER,
  env.DB_PASSWORD,
  env.DB_NAME,
  env.DB_PORT
);

database.connection.connect((err) => {
  if (err) {
    console.log("Error connecting to database", database.config, err);
    return;
  }
  console.log("Successfully connected to database");
});

// Do not apply authentication globally — keep login public and protect routes explicitly.
// The `auth` module exported a middleware function (authenticateToken).

// Parse JSON bodies
app.use(express.json());

// Public routes
app.get("/", (req, res) => {
  res.send("hello");
});

// Login route: checks credentials and returns a signed JWT
app.post("/api/login", (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  // Lookup user in the database
  const sql =
    "SELECT id, email, password, role FROM users WHERE email = ? LIMIT 1";
  database.connection.execute(sql, [email], (err, results) => {
    if (err) {
      console.error("DB error during login:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (!results || results.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = results[0];

    // NOTE: This compares plaintext passwords. In production we MUST hash passwords
    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Create JWT payload (keep it small)
    const payload = { id: user.id, email: user.email, role: user.role };
    const secret = process.env.ACCESS_TOKEN_SECRET;
    const token = jwt.sign(payload, secret, { expiresIn: "1h" });

    return res.json({ accessToken: token });
  });
});

// Example protected route (use this pattern for routes that must be authenticated)
app.get("/api/protected", auth, (req, res) => {
  // `auth` sets req.user when token is valid
  res.json({ message: "Protected data", user: req.user });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
