const mysql = require("mysql2");
const fs = require("fs");

const SQL_FILES = {
  CREATE_USERS_TABLE: "./src/sql/create_users_table.sql",
  INSERT_INTO_USERS: "../sql/insert_into_users.sql",
};

const ENCODING = {
  UTF8: "utf-8",
};

class Database {
  constructor(host, user, password, database) {
    this.config = {
      host: host,
      user: user,
      password: password,
      database: database,
    };

    this.connection = mysql.createConnection(this.config);

    this.connection.connect((err) => {
      if (err) {
        console.log("Error connecting to database", database.config, err);
        return;
      }
      console.log("Successfully connected to database");
    });
  }

  createUserTable() {
    const sql = fs.readFileSync(SQL_FILES.CREATE_USERS_TABLE, ENCODING.UTF8);
    console.log(sql);
  }

  insertUser(email, password) {}
}

module.exports = Database;
