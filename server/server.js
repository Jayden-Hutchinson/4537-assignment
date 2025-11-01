require("dotenv/config");

const Database = require("./src/js/database");
const auth = require("./src/js/authentication");

const jwt = require("jsonwebtoken");
const cors = require("cors");

const express = require("express");

const app = express();

// Use provided PORT or fallback for local development
const PORT = process.env.PORT || 4537;

const database = new Database(
  process.env.DB_HOST,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  process.env.DB_NAME,
  process.env.DB_PORT
);

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

// PUBLIC ROUTES
app.get("/", (req, res) => {
  res.send("Logged In");
});

app.post("/api/signup", (req, res) => {
  const { email, password } = req.body || {};
  console.log(email, password);

  database.insertUser(email, password);
});

// Login route: checks credentials and returns a signed JWT
app.post("/api/login", (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  const user = database.selectUserByEmail(email);
  console.log("User", user);

  if (!user) {
    res.status(500).json({ error: "Error getting user from database" });
  }

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

// Example protected route (use this pattern for routes that must be authenticated)
app.get("/api/protected", auth, (req, res) => {
  // `auth` sets req.user when token is valid
  res.json({ message: "Protected data", user: req.user });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
