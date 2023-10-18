const usersRouter = require("express").Router();
const { getUsers, getUser } = require("../controllers/users.controllers");

usersRouter.get("/", getUsers);
usersRouter.get("/:user_name", getUser);

module.exports = usersRouter;
