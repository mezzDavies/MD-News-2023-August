const express = require("express");
const app = express();
const { handle500s, handle404s } = require("./app-error-handlers");
const { getTopics } = require("./controllers/topics.controllers");
const { getEndpointsJson } = require("./controllers/api.controllers");

app.get("/api/topics", getTopics);
app.get("/api", getEndpointsJson);

app.use("/*", handle404s);
app.use(handle500s);

module.exports = app;
