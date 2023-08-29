const { fetchArticleComments } = require("../models/comments.models");

module.exports.getArticleComments = (req, res, next) => {
  const { article_id } = req.params;

  fetchArticleComments(article_id)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch((err) => {
      console.log("🔹 / file: comments.controllers.js:11 / err >>> ", err);

      next(err);
    });
};
