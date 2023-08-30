const {
  fetchArticleComments,
  addComment,
} = require("../models/comments.models");

module.exports.getArticleComments = (req, res, next) => {
  const { article_id } = req.params;

  fetchArticleComments(article_id)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.postComment = (req, res, next) => {
  const { article_id } = req.params;

  addComment(req, article_id).then((comment) => {
    res.status(201).send({ comment });
  });
  // .catch((err) => {
  //   next(err);
  // });
};
