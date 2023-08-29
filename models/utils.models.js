const format = require("pg-format");
const db = require("../db/connection");

module.exports.checkExists = (table, column, value) => {
  // %I is an identifier in pg-format
  const queryStr = format("SELECT * FROM %I WHERE %I = $1;", table, column);

  return db.query(queryStr, [value]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Resource not found" });
    }
  });
};
