const {
  fetchArticleById,
  fetchArticles,
  updateArticle,
  addArticle,
} = require("../models/articles.models");

const { fetchTopics } = require("../models/topics.models");

module.exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  fetchArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.getArticles = (req, res, next) => {
  const { topic, sort_by, order } = req.query;
  fetchTopics()
    .then((topics) => {
      const validTopicQueries = topics.map((topic) => {
        return topic.slug;
      });
      return fetchArticles(validTopicQueries, topic, sort_by, order);
    })
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.patchArticle = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;

  updateArticle(article_id, inc_votes)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.postArticle = (req, res, next) => {
  const { author, title, body, topic, article_img_url } = req.body;
  addArticle(author, title, body, topic, article_img_url)
    .then((article) => {
      res.status(201).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};
