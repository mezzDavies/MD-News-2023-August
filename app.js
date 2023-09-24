const express = require("express");
const app = express();

const apiRouter = require("./routes/api-router");

const {
  handle500s,
  handle404s,
  handleCustomErrors,
  handlePsqlErrors,
} = require("./app-error-handlers");

app.use(express.json());
app.use("/api", apiRouter);

app.use("/*", handle404s);
app.use(handleCustomErrors);
app.use(handlePsqlErrors);
app.use(handle500s);

module.exports = app;
