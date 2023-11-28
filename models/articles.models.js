const db = require("../db/connection");

const { checkExists } = require("../models/utils.models");

module.exports.fetchArticleById = (article_id) => {
  const queryStr = `SELECT articles.*, 
                    CAST(COUNT(comments.article_id) AS INTEGER) AS comment_count
                    FROM articles 
                    LEFT JOIN comments ON articles.article_id = comments.article_id 
                    WHERE articles.article_id = $1
                    GROUP BY articles.article_id;`;

  return db.query(queryStr, [article_id]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "article not found" });
    }
    return rows[0];
  });
};

module.exports.fetchArticles = (
  validTopics,
  topic,
  sortByColumn = "created_at",
  order
) => {
  if (topic && !validTopics.includes(topic)) {
    return Promise.reject({
      msg: "Topic not found",
      status: 404,
    });
  }

  const validSortBys = [
    "author",
    "title",
    "topic",
    "created_at",
    "votes",
    "comment_count",
  ];

  const validOrderBys = ["DESC", "ASC"];

  if (
    (order && !validOrderBys.includes(order.toUpperCase())) ||
    !validSortBys.includes(sortByColumn)
  ) {
    return Promise.reject({
      msg: "Bad request",
      status: 400,
    });
  }

  let queryStr = `SELECT articles.author, 
                  articles.title,
                  articles.article_id,
                  articles.topic,
                  articles.created_at,
                  articles.votes,
                  articles.article_img_url,
                  SUBSTRING(articles.body from '(^(?:\\S+\\s+\\n?){1,9}\\w+)') || '...' AS abridged_body,
                  CAST(COUNT(comments.article_id) AS INTEGER) AS comment_count
                  FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id `;

  if (topic) {
    queryStr += `WHERE topic = '${topic}'`;
  }

  queryStr += `GROUP BY articles.article_id ORDER BY ${sortByColumn}`;

  if (sortByColumn === "created_at" && !order) {
    queryStr += ` DESC;`;
  }
  if (order) {
    queryStr += ` ${order};`;
  }

  return db.query(queryStr).then(({ rows }) => {
    return rows;
  });
};

module.exports.updateArticle = (article_id, votes) => {
  const queryStr = `UPDATE articles 
                    SET votes = votes + $1
                    WHERE article_id = $2
                    RETURNING *;`;

  return db.query(queryStr, [votes, article_id]).then(({ rows }) => {
    if (!rows.length) {
      return Promise.all([
        rows,
        checkExists("articles", "article_id", article_id, "Article"),
      ]).then((articleExists) => {
        return articleExists[0];
      });
    }

    return rows[0];
  });
};
