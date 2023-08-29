module.exports.handle404s = (req, res, next) => {
  res.status(404).send({ msg: "oops! invalid url" });
};

module.exports.handle500s = (err, req, res, next) => {
  console.log("ERROR FROM 500 ERROR HANDLER...", err);
  res.status(500).send({ msg: "Oh dear. Looks like our server is brock" });
};

module.exports.handleCustomErrors = (err, req, res, next) => {
  if (err.status) {
    const { msg, status } = err;
    res.status(status).send({ msg });
  } else {
    next(err);
  }
};

module.exports.handlePsqlErrors = (err, req, res, next) => {
  const { code } = err;
  if (code === "22P02") {
    const msg = "Bad request";
    res.status(400).send({ msg });
  } else {
    next(err);
  }
};
