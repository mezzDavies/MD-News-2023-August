const commentsRouter = require("express").Router();
const {
  deleteComment,
  updateComment,
} = require("../controllers/comments.controllers");

commentsRouter.delete("/:comment_id", deleteComment);
commentsRouter.patch("/:comment_id", updateComment);
module.exports = commentsRouter;
