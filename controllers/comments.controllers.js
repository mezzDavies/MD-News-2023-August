const { checkExists } = require("../models/utils.models");
const {
  fetchArticleComments,
  addComment,
  removeComment,
  updateComment,
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

  addComment(req, article_id)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.deleteComment = (req, res, next) => {
  const { comment_id } = req.params;
  const promiseAndId = [
    checkExists("comments", "comment_id", comment_id, "Comment"),
    comment_id,
  ];
  Promise.all(promiseAndId)
    .then((commentExists) => {
      removeComment(commentExists[0]);
    })
    .then(() => {
      res.status(204).send();
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.updateComment = (req, res, next) => {
  const { comment_id } = req.params;
  const { inc_votes } = req.body;
  updateComment(comment_id, inc_votes)
    .then((comment) => {
      res.status(200).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};
