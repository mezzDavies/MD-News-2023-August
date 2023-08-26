const { fetchArticleById } = require("../models/article.models");

module.exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  fetchArticleById(article_id)
    .then((article) => {
      console.log("shouldn't seet this!");
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};
