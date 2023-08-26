const db = require("../db/connection");
const format = require("pg-format");
module.exports.fetchArticleById = (article_id) => {
  const queryStr = `SELECT * FROM articles 
                    WHERE article_id = $1;`;

  return db.query(queryStr, [article_id]).then(({ rows }) => {
    return rows[0];
  });
};
