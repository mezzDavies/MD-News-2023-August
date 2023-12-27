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
  const { code, detail } = err;
  if (code === "22P02") {
    const msg = "Bad request";
    res.status(400).send({ msg });
  } else if (code === "23502") {
    const msg = "Missing properties";
    res.status(400).send({ msg });
  } else if (code === "23503") {
    let msg = "";
    if (detail.includes("author")) {
      msg = "Username not found";
    }
    if (detail.includes("article_id")) {
      msg = "Article not found";
    }
    if (detail.includes("topic")) {
      msg = "Topic not found";
    }

    res.status(404).send({ msg });
  } else {
    next(err);
  }
};
