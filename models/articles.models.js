const db = require("../db/connection");

const { checkExists } = require("../models/utils.models");

const fetchArticleById = (article_id) => {
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
module.exports.fetchArticleById = fetchArticleById;

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

  let queryStr = `SELECT articles.author, articles.title,
                  articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, 
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

module.exports.addArticle = (author, title, body, topic, article_img_url) => {
  let queryStr = `INSERT INTO articles (author, title, body, topic `;

  const imgUrlEnd = ` VALUES ($1, $2, $3, $4, $5)
                    returning *;`;

  const noImgUrlEnd = ` VALUES ($1, $2, $3, $4)
                    returning *;`;

  article_img_url
    ? (queryStr += `, article_img_url) ${imgUrlEnd}`)
    : (queryStr += `) ${noImgUrlEnd}`);

  const values = [author, title, body, topic];
  if (article_img_url) values.push(article_img_url);

  return db.query(queryStr, values).then(({ rows }) => {
    return fetchArticleById(rows[0].article_id);
  });
};
