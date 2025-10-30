require("dotenv/config");

const Database = require("./src/js/database");
const express = require("express");
const app = express();

const env = process.env;

const PORT = env.PORT;

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

const logger = (req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
};

const authenticator = (req, res, next) => {
  console.log("auth");
  next();
};

app.use(logger, authenticator);

app.get("/", (req, res) => {
  res.send("hello");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
