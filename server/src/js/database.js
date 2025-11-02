const mysql = require("mysql2/promise");
const fs = require("fs");

const SQL_FILES = {
  CREATE_USERS_TABLE: "./src/sql/create_users_table.sql",
  INSERT_INTO_USERS: "./src/sql/insert_into_users.sql",
  SELECT_USER_BY_EMAIL: "./src/sql/select_user_by_email.sql",
};

const ENCODING = {
  UTF8: "utf-8",
};

class Database {
  constructor() {
    this.connection = null; // connection will be initialized asynchronously
  }

  // Async init method to create connection
  async init(host, user, password, database) {
    this.connection = await mysql.createConnection({
      host,
      user,
      password,
      database,
    });
    console.log("[database] Connected");

    // create users table
    await this.createUserTable();
  }

  async createUserTable() {
    const sql = fs.readFileSync(SQL_FILES.CREATE_USERS_TABLE, ENCODING.UTF8);
    await this.connection.execute(sql);
    console.log("[database] Users table created or already exists");
  }

  async insertUser(email, password, role = "user") {
    const sql = fs.readFileSync(SQL_FILES.INSERT_INTO_USERS, ENCODING.UTF8);
    await this.connection.execute(sql, [email, password, role]);
    console.log("User added to database");
  }

  async selectUserByEmail(email) {
    const sql = fs.readFileSync(SQL_FILES.SELECT_USER_BY_EMAIL, ENCODING.UTF8);
    const [results] = await this.connection.execute(sql, [email]);
    return results[0]; // returns user object or undefined
  }
}

module.exports = Database;
