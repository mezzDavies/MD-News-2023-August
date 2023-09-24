const {
  getArticleById,
  getArticles,
  patchArticle,
} = require("../controllers/articles.controllers");

const {
  getArticleComments,
  postComment,
} = require("../controllers/comments.controllers");

const articlesRouter = require("express").Router();

articlesRouter.get("/", getArticles);
articlesRouter.get("/:article_id", getArticleById);
articlesRouter.get("/:article_id/comments", getArticleComments);
articlesRouter.post("/:article_id/comments", postComment);
articlesRouter.patch("/:article_id", patchArticle);

module.exports = articlesRouter;
