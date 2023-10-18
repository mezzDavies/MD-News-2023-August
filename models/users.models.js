const db = require("../db/connection");

module.exports.fetchUsers = () => {
  const queryStr = `SELECT * FROM users;`;
  return db.query(queryStr).then(({ rows }) => {
    return rows;
  });
};

module.exports.fetchUser = (username) => {
  const queryStr = `
  SELECT * FROM users
  WHERE username = $1;`;
  return db.query(queryStr, [username]).then(({ rows }) => {
    if (!rows.length) {
      return Promise.reject({
        status: 404,
        msg: `user ${username} not found`,
      });
    }
    return rows[0];
  });
};
