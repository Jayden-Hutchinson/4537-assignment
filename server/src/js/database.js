const mysql = require("mysql2/promise");
const fs = require("fs");

const SQL_FILES = {
  CREATE_USERS_TABLE: "./src/sql/create_users_table.sql",
  INSERT_INTO_USERS: "./src/sql/insert_into_users.sql",
  SELECT_USER_BY_EMAIL: "./src/sql/select_user_by_email.sql",
  CREATE_USAGE_TABLE: "./src/sql/create_usage_table.sql",
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

    console.log(`[database] Database ${database} connected with Host ${host}`);

    // create users table
    await this.createUserTable();
    // create usage table
    await this.createUsageTable();
  }

  async createUserTable() {
    const sql = fs.readFileSync(SQL_FILES.CREATE_USERS_TABLE, ENCODING.UTF8);
    await this.connection.execute(sql);
    console.log('[database] Table "users" created or already exists');
  }

  async createUsageTable() {
    const sql = fs.readFileSync(SQL_FILES.CREATE_USAGE_TABLE, ENCODING.UTF8);
    await this.connection.execute(sql);
    console.log('[database] Table "usage_events" created or already exists');
  }

  async insertUser(email, password, role = "user") {
    const sql = fs.readFileSync(SQL_FILES.INSERT_INTO_USERS, ENCODING.UTF8);
    await this.connection.execute(sql, [email, password, role]);
    console.log(`[database] User ${email} added to database as ${role}`);
  }

  async selectUserByEmail(email) {
    const sql = fs.readFileSync(SQL_FILES.SELECT_USER_BY_EMAIL, ENCODING.UTF8);
    const [results] = await this.connection.execute(sql, [email]);
    return results[0]; // returns user object or undefined
  }

  // Insert a usage event for a given user (email), method and endpoint
  async insertUsage(email, method, endpoint) {
    const sql = `INSERT INTO usage_events (email, method, endpoint) VALUES (?, ?, ?)`;
    await this.connection.execute(sql, [email, method, endpoint]);
  }

  // Aggregate endpoint stats
  async getEndpointStats() {
    const sql = `SELECT method, endpoint, COUNT(*) as requests FROM usage_events GROUP BY method, endpoint`;
    const [rows] = await this.connection.execute(sql);
    return rows;
  }

  // Get per-user total counts
  async getUserUsageSummary() {
    const sql = `SELECT email, COUNT(*) as totalRequests FROM usage_events GROUP BY email`;
    const [rows] = await this.connection.execute(sql);
    return rows;
  }

  // Get a single user's usage details
  async getUserUsage(email) {
    const sql = `SELECT method, endpoint, COUNT(*) as count FROM usage_events WHERE email = ? GROUP BY method, endpoint`;
    const [rows] = await this.connection.execute(sql, [email]);
    const totalSql = `SELECT COUNT(*) as total FROM usage_events WHERE email = ?`;
    const [trows] = await this.connection.execute(totalSql, [email]);
    const total = trows[0] ? trows[0].total : 0;
    return { total, perEndpoint: rows };
  }
}

module.exports = Database;
