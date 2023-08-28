const db = require("../db/connection");

module.exports.fetchArticleById = (article_id) => {
  const queryStr = `SELECT * FROM articles 
                    WHERE article_id = $1;`;

  return db.query(queryStr, [article_id]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "article not found" });
    }
    return rows[0];
  });
};

module.exports.fetchArticles = () => {
  const queryStr = `SELECT articles.author, articles.title,
                    articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.article_id) AS comment_count
                    FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id
                    GROUP BY articles.article_id
                    ORDER BY articles.created_at DESC;`;
  return db.query(queryStr).then(({ rows }) => {
    return rows;
  });
};
