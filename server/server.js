require("dotenv/config");

const express = require("express");
const app = express();

const PORT = process.env.PORT;

const logger = (req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
};

const authenticator = (req, res, next) => {
  console.log("auth");
};

app.use(logger, authenticator);

app.get("/hello", (req, res) => {
  res.send("hello");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
