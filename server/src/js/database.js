const mysql = require("mysql2");

class Database {
  constructor(host, user, password, database) {
    this.config = {
      host: host,
      user: user,
      password: password,
      database: database,
    };

    this.connection = mysql.createConnection(this.config);
  }
}

module.exports = Database;
