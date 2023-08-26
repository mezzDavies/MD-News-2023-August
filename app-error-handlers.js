module.exports.handle404s = (req, res, next) => {
  res.status(404).send({ msg: "oops! invalid url" });
};

module.exports.handle500s = (err, req, res, next) => {
  console.log("ERROR FROM 500 ERROR HANDLER...", err);
  res.status(500).send({ msg: "Oh dear. Looks like our server is brock" });
};
