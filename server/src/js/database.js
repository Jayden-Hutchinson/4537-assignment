const mysql = require("mysql2");
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

    this.createUserTable();
  }

  createUserTable() {
    const sql = fs.readFileSync(SQL_FILES.CREATE_USERS_TABLE, ENCODING.UTF8);
    this.connection.execute(sql);
  }

  insertUser(email, password, role = "user") {
    const sql = fs.readFileSync(SQL_FILES.INSERT_INTO_USERS, ENCODING.UTF8);
    this.connection.execute(sql, [email, password, role], (err) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log("User added to database");
    });
  }

  selectUserByEmail(email) {
    const sql = fs.readFileSync(SQL_FILES.SELECT_USER_BY_EMAIL, ENCODING.UTF8);
    console.log(sql);
    this.connection.execute(sql, [email], (err, results) => {
      if (err) {
        console.error("DB error during login:", err);
        return;
      }

      if (!results || results.length === 0) {
        return;
      }

      console.log(results);
      const user = results[0];
      return user;
    });
  }
}

module.exports = Database;
