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
      ]).then((success) => {
        return success[0];
      });
    }
    return rows;
  });
};
