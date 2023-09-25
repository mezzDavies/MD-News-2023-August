const topicsRouter = require("./topics-router");
const articlesRouter = require("./articles-router");
const commentsRouter = require("./comments-router");
const usersRouter = require("./users-router");

const { getEndpointsJson } = require("../controllers/api.controllers");
const apiRouter = require("express").Router();

apiRouter.get("/", getEndpointsJson);
apiRouter.use("/topics", topicsRouter);
apiRouter.use("/articles", articlesRouter);
apiRouter.use("/comments", commentsRouter);
apiRouter.use("/users", usersRouter);

module.exports = apiRouter;
