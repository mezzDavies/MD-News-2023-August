const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testdata = require("../db/data/test-data");
const endpointsFile = require("../endpoints.json");
const { checkExists } = require("../models/utils.models");

beforeEach(() => {
  return seed(testdata);
});

afterAll(() => {
  return db.end();
});

describe("STATUS:404 returns appropriate message for invalid urls", () => {
  test("GET", () => {
    return request(app)
      .get("/api/invalid-url")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("oops! invalid url");
      });
  });
  test("POST", () => {
    return request(app)
      .post("/api/invalid-url")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("oops! invalid url");
      });
  });
  test("PATCH", () => {
    return request(app)
      .patch("/api/invalid-url")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("oops! invalid url");
      });
  });
  test("DELETE", () => {
    return request(app)
      .delete("/api/invalid-url")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("oops! invalid url");
      });
  });
});

describe("GET /api", () => {
  test("STATUS:200 returns endpoints.json file", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsFile);
      });
  });
});

describe("GET /api/topics ", () => {
  test("STATUS:200 returns array of all topics", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body: { topics } }) => {
        expect(topics.length).toBe(3);
        topics.forEach((topic) => {
          expect(topic).toEqual(
            expect.objectContaining({
              description: expect.any(String),
              slug: expect.any(String),
            })
          );
        });
      });
  });
});

describe("GET /api/articles/article-id", () => {
  test("STATUS:200 returns requested article", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article).toEqual(
          expect.objectContaining({
            author: expect.any(String),
            title: expect.any(String),
            article_id: 1,
            body: expect.any(String),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
          })
        );
      });
  });

  test("STATUS:200 returned article has comment_count property", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article).toHaveProperty("comment_count", 11);
      });
  });

  test("STATUS:404 returns error message for valid but non-existent article-id", () => {
    return request(app)
      .get("/api/articles/99999")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("article not found");
      });
  });
  test("STATUS:400 returns error message for invalid article-id", () => {
    return request(app)
      .get("/api/articles/not_an_id")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
});

describe("GET /api/articles", () => {
  test("STATUS:200 returns array of all article objects", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length).toBe(13);
        articles.forEach((article) => {
          expect(article).toEqual(
            expect.objectContaining({
              author: expect.any(String),
              title: expect.any(String),
              article_id: expect.any(Number),
              topic: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              article_img_url: expect.any(String),
            })
          );
        });
      });
  });
  test("STATUS:200 articles do not have body property", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length).toBe(13);
        articles.forEach((article) => {
          expect(article).not.toHaveProperty("body");
        });
      });
  });
  test("STATUS:200 articles have comment_count property", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length).toBe(13);
        articles.forEach((article) => {
          expect(article).toHaveProperty("comment_count");
          expect(typeof article.comment_count).toBe("number");
        });
      });
  });
  test("STATUS:200 articles are sorted by date - in descending order as default", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("STATUS:200 articles have abridged_body property", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length).toBe(13);
        articles.forEach((article) => {
          expect(article).toHaveProperty("abridged_body");
          const words = article.abridged_body.split(" ");

          expect(words.length).toBeLessThanOrEqual(10);
          expect(article.abridged_body.endsWith("...")).toBe(true);
        });
      });
  });

  describe("QUERIES...", () => {
    test("STATUS:200 accepts TOPICS queries - sorted by date in decending order as default", () => {
      return request(app)
        .get("/api/articles?topic=mitch")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(12);
          articles.forEach((article) => {
            expect(article).toEqual(
              expect.objectContaining({
                author: expect.any(String),
                title: expect.any(String),
                article_id: expect.any(Number),
                topic: "mitch",
                created_at: expect.any(String),
                votes: expect.any(Number),
                article_img_url: expect.any(String),
              })
            );
          });
          expect(articles).toBeSortedBy("created_at", { descending: true });
        });
    });
    test("STATUS:200 accepts SORT-BY queries in ascending order as default", () => {
      return request(app)
        .get("/api/articles?sort_by=author")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(13);
          expect(articles).toBeSortedBy("author");
        });
    });

    test("STATUS:200 accepts ORDER queries", () => {
      return request(app)
        .get("/api/articles?order=ASC")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(13);
          expect(articles).toBeSortedBy("created_at");
        });
    });
    test("STATUS:200 accepts FULL queries", () => {
      return request(app)
        .get("/api/articles?topic=mitch&sort_by=created_at&order=ASC")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(12);
          expect(articles).toBeSortedBy("created_at");
        });
    });
    test("STATUS:200 returns empty array for valid topic query with no articles", () => {
      return request(app)
        .get("/api/articles?topic=paper")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toEqual([]);
        });
    });
    test("STATUS:404 returns error message for invalid TOPIC", () => {
      return request(app)
        .get("/api/articles?topic=badness")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Topic not found");
        });
    });
    test("STATUS:400 returns error message for invalid SORT-BY", () => {
      return request(app)
        .get("/api/articles?sort_by=badJuju")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
    test("STATUS:400 returns error message for invalid ORDER", () => {
      return request(app)
        .get("/api/articles?order=badJuju")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("STATUS:200 returns an array of comments for article", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toHaveLength(11);
        comments.forEach((comment) => {
          expect(comment).toEqual(
            expect.objectContaining({
              comment_id: expect.any(Number),
              body: expect.any(String),
              article_id: expect.any(Number),
              author: expect.any(String),
              votes: expect.any(Number),
              created_at: expect.any(String),
            })
          );
        });
      });
  });

  test("STATUS:200 array of comments is sorted by date - most recent first ", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toHaveLength(11);
        expect(comments).toBeSortedBy("created_at", { descending: true });
      });
  });

  test("STATUS:200 returns an empty array for an article with no comments", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toEqual([]);
      });
  });

  test("STATUS:404 returns appropriate error message for a non-existent but valid article_id", () => {
    return request(app)
      .get("/api/articles/9999/comments")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Resource not found");
      });
  });
  test("STATUS:400 returns appropriate error message for an invalid article_id", () => {
    return request(app)
      .get("/api/articles/badness/comments")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
});

describe("POST /api/articles", () => {
  test("STATUS:201 returns successfully posted article", () => {
    const newArticle = {
      author: "butter_bridge",
      title: "interesting stuff",
      body: "Lorem ipsum interesting article words",
      topic: "cats",
      article_img_url: "www.pictures.com/interesting_pic.jpg",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(201)
      .then(({ body: { article } }) => {
        expect(article).toEqual(
          expect.objectContaining({
            article_id: expect.any(Number),
            title: "interesting stuff",
            topic: "cats",
            author: "butter_bridge",
            body: "Lorem ipsum interesting article words",
            created_at: expect.any(String),
            votes: 0,
            article_img_url: "www.pictures.com/interesting_pic.jpg",
            comment_count: 0,
          })
        );
      });
  });

  test("STATUS:201 article has default image url if not provided on request", () => {
    const newArticle = {
      author: "butter_bridge",
      title: "interesting stuff",
      body: "Lorem ipsum interesting article words",
      topic: "cats",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(201)
      .then(({ body: { article } }) => {
        expect(article).toEqual(
          expect.objectContaining({
            article_id: expect.any(Number),
            title: "interesting stuff",
            topic: "cats",
            author: "butter_bridge",
            body: "Lorem ipsum interesting article words",
            created_at: expect.any(String),
            votes: 0,
            article_img_url:
              "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700",
            comment_count: 0,
          })
        );
      });
  });

  test("STATUS: 404 returns error message if topic does not exist", () => {
    const newArticle = {
      author: "butter_bridge",
      title: "interesting stuff",
      body: "Lorem ipsum interesting article words",
      topic: "I do not exist",
    };

    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Topic not found");
      });
  });

  test("STATUS: 404 returns error message if username does not exist", () => {
    const newArticle = {
      author: "not_a_user",
      title: "interesting stuff",
      body: "Lorem ipsum interesting article words",
      topic: "cats",
    };

    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Username not found");
      });
  });

  test("STATUS: 400 returns error message if requesst body is missing properties", () => {
    const newArticle = {
      title: "interesting stuff",
      body: "Lorem ipsum interesting article words",
      topic: "cats",
    };

    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Missing properties");
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("STATUS:201 returns successfully posted comment", () => {
    const newComment = {
      username: "butter_bridge",
      body: "one two one two testing",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(201)
      .then(({ body: { comment } }) => {
        expect(comment).toEqual(
          expect.objectContaining({
            comment_id: expect.any(Number),
            article_id: 1,
            author: "butter_bridge",
            body: "one two one two testing",
            created_at: expect.any(String),
            votes: 0,
          })
        );
      });
  });

  test("STATUS:201 ignores unneeded properties on request and still returns successfully posted comment", () => {
    const newComment = {
      username: "butter_bridge",
      body: "one two one two testing",
      unneeded: "bad juju",
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(newComment)
      .expect(201)
      .then(({ body: { comment } }) => {
        expect(comment).toEqual(
          expect.objectContaining({
            comment_id: expect.any(Number),
            article_id: 2,
            author: "butter_bridge",
            body: "one two one two testing",
            created_at: expect.any(String),
            votes: 0,
          })
        );
      });
  });

  test("STATUS:400 returns error message if request has missing properties", () => {
    const badComment = {};
    return request(app)
      .post("/api/articles/1/comments")
      .send(badComment)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Missing properties");
      });
  });
  test("STATUS:400 returns error message for invalid article_id ", () => {
    const newComment = {
      username: "butter_bridge",
      body: "one two one two testing",
    };
    return request(app)
      .post("/api/articles/not-an-id/comments")
      .send(newComment)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });

  test("STATUS:404 returns error message for valid but non-existent article_id", () => {
    const newComment = {
      username: "butter_bridge",
      body: "one two one two testing",
    };
    return request(app)
      .post("/api/articles/99999/comments")
      .send(newComment)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Article not found");
      });
  });

  test("STATUS:404 returns error message for invalid username", () => {
    const newComment = {
      username: "not_a_user",
      body: "one two one two testing",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Username not found");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("STATUS:200 returns updated article with POSITIVE votes", () => {
    const patchRequest = { inc_votes: 1 };
    return request(app)
      .patch("/api/articles/1")
      .send(patchRequest)
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article).toEqual(
          expect.objectContaining({
            title: expect.any(String),
            article_id: 1,
            topic: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            created_at: expect.any(String),
            votes: 101,
            article_img_url: expect.any(String),
          })
        );
      });
  });
  test("STATUS:200 returns updated article with NEGATIVE votes", () => {
    const patchRequest = { inc_votes: -1 };
    return request(app)
      .patch("/api/articles/1")
      .send(patchRequest)
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article).toEqual(
          expect.objectContaining({
            title: expect.any(String),
            article_id: 1,
            topic: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            created_at: expect.any(String),
            votes: 99,
            article_img_url: expect.any(String),
          })
        );
      });
  });

  test("STATUS:404 returns error message for valid but nonexistent article_id", () => {
    const patchRequest = { inc_votes: 1 };
    return request(app)
      .patch("/api/articles/99999")
      .send(patchRequest)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Article not found");
      });
  });
  test("STATUS:400 returns error message for invalid article_id", () => {
    const patchRequest = { inc_votes: 1 };
    return request(app)
      .patch("/api/articles/badness")
      .send(patchRequest)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
  test("STATUS:400 returns error message for malformed request body", () => {
    const patchRequest = { inc_votes: "one" };
    return request(app)
      .patch("/api/articles/1")
      .send(patchRequest)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("STATUS:204 comment is deleted and no content returned", () => {
    return request(app)
      .delete("/api/comments/1")
      .expect(204)
      .then((res) => {
        expect(res.body).toEqual({});
      })
      .then(() => {
        return checkExists("comments", "comment_id", 1, "test comment");
      })
      .catch((err) => {
        expect(err).toEqual({ status: 404, msg: "test comment not found" });
      });
  });

  test("STATUS:404 returns error message for valid but non-existent comment_id", () => {
    return request(app)
      .delete("/api/comments/99999")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Comment not found");
      });
  });

  test("STATUS:400 returns error message for invalid comment_id", () => {
    return request(app)
      .delete("/api/comments/yet-more-badness")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
});

describe("PATCH /api/comments/:comment_id", () => {
  test("STATUS:200 returns updated comment object with updated votes", () => {
    const patchRequest = { inc_votes: 1 };
    return request(app)
      .patch("/api/comments/1")
      .send(patchRequest)
      .expect(200)
      .then(({ body: { comment } }) => {
        expect(comment).toEqual(
          expect.objectContaining({
            body: expect.any(String),
            votes: 17,
            author: "butter_bridge",
            article_id: 9,
          })
        );
      });
  });

  test("STATUS:404 returns error message for valid but nonexistent comment_id", () => {
    const patchRequest = { inc_votes: 1 };
    return request(app)
      .patch("/api/comments/99999")
      .send(patchRequest)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("comment not found");
      });
  });

  test("STATUS:400 returns error message for invalid comment_id", () => {
    const patchRequest = { inc_votes: 1 };
    return request(app)
      .patch("/api/comments/badness")
      .send(patchRequest)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });

  test("STATUS:400 returns error message for malformed request body", () => {
    const patchRequest = { inc_votes: "one" };
    return request(app)
      .patch("/api/comments/1")
      .send(patchRequest)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
});

describe("GET /api/users", () => {
  test("STATUS:200 returns array of all users objects", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body: { users } }) => {
        expect(users).toHaveLength(4);
        users.forEach((user) => {
          expect(user).toEqual(
            expect.objectContaining({
              username: expect.any(String),
              name: expect.any(String),
              avatar_url: expect.any(String),
            })
          );
        });
      });
  });
});

describe("GET /api/users/:username", () => {
  test("STATUS 200: returns requested username object", () => {
    return request(app)
      .get("/api/users/lurker")
      .expect(200)
      .then(({ body: { user } }) => {
        expect(user).toEqual({
          username: "lurker",
          name: "do_nothing",
          avatar_url:
            "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png",
        });
      });
  });
  test("STATUS:404 returns appropriate error message for a non-existent username", () => {
    return request(app)
      .get("/api/users/lord_lucan")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("user lord_lucan not found");
      });
  });
});
