const db = require("../db/connection");
const { checkExists } = require("../models/utils.models");

module.exports.fetchArticleComments = (article_id) => {
  const queryStr = `SELECT * FROM comments
                    WHERE article_id = $1
                    ORDER BY created_at DESC;`;

  return db.query(queryStr, [article_id]).then(({ rows }) => {
    if (!rows.length) {
      return Promise.all([
        rows,
        checkExists("articles", "article_id", article_id),
      ]).then((articleExists) => {
        return articleExists[0];
      });
    }
    return rows;
  });
};

module.exports.addComment = ({ body: { body, username } }, article_id) => {
  const queryStr = `INSERT INTO comments (body, author, article_id) 
                    VALUES ($1, $2, $3)
                    RETURNING *;`;
  const values = [body, username, article_id];
  return db.query(queryStr, values).then(({ rows }) => {
    return rows[0];
  });
};

module.exports.removeComment = (comment_id) => {
  const queryStr = `DELETE FROM comments
                    WHERE comment_id = $1
                    RETURNING *;`;
  return db.query(queryStr, [comment_id]).then(({ rows }) => {});
};
