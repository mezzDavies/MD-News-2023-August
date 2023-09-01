const db = require("../db/connection");

module.exports.fetchUsers = () => {
  const queryStr = `SELECT * FROM users;`;
  return db.query(queryStr).then(({ rows }) => {
    return rows;
  });
};
