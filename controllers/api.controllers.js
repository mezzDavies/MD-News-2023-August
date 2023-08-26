const endpoints = require("../endpoints.json");

module.exports.getEndpointsJson = (req, res, next) => {
  res.status(200).send({ endpoints });
};
