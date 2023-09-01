const express = require("express");
const app = express();

const {
  handle500s,
  handle404s,
  handleCustomErrors,
  handlePsqlErrors,
} = require("./app-error-handlers");

app.use(express.json());

const { getTopics } = require("./controllers/topics.controllers");
const { getEndpointsJson } = require("./controllers/api.controllers");
const {
  getArticleById,
  getArticles,
  patchArticle,
} = require("./controllers/articles.controllers");
const {
  getArticleComments,
  postComment,
  deleteComment,
} = require("./controllers/comments.controllers");

app.get("/api/topics", getTopics);
app.get("/api", getEndpointsJson);
app.get("/api/articles/:article_id", getArticleById);
app.get("/api/articles/", getArticles);
app.get("/api/articles/:article_id/comments", getArticleComments);

app.post("/api/articles/:article_id/comments", postComment);

app.patch("/api/articles/:article_id", patchArticle);

app.delete("/api/comments/:comment_id", deleteComment);

app.use("/*", handle404s);
app.use(handleCustomErrors);
app.use(handlePsqlErrors);
app.use(handle500s);

module.exports = app;
