const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testdata = require("../db/data/test-data");
const endpointsFile = require("../endpoints.json");

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
      .get("/api/articles/not-an-id")
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
        });
      });
  });
  test("STATUS:200 articles are sorted by date - descending", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("created_at", { descending: true });
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

  test("STATUS:201 ignores unnneeded properties on request and still returns successfully posted comment", () => {
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

  test("STATUS:404 returns error message for valid but non-existent article_id ", () => {
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
// ***** UPDATE ENDPOINTS.JSON *****
