const express = require("express");
const app = express();
const {
  handle500s,
  handle404s,
  handleCustomErrors,
} = require("./app-error-handlers");

const { getTopics } = require("./controllers/topics.controllers");
const { getEndpointsJson } = require("./controllers/api.controllers");
const { getArticleById } = require("./controllers/articles.controllers");

app.get("/api/topics", getTopics);
app.get("/api", getEndpointsJson);
app.get("/api/articles/:article_id", getArticleById);

app.use("/*", handle404s);
app.use(handleCustomErrors);
app.use(handle500s);

module.exports = app;
