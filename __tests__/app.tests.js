const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testdata = require("../db/data/test-data");
// run seed - before each
beforeEach(() => {
  return seed(testdata);
});
afterAll(() => {
  return db.end();
});
// generic 404 test
describe("STATUS:404 returns appropriate message for invalid urls", () => {
  test("GET", () => {
    return request(app)
      .get("/api/invalid-url")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("invalid url");
      });
  });
  test("POST", () => {
    return request(app)
      .post("/api/invalid-url")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("invalid url");
      });
  });
  test("PATCH", () => {
    return request(app)
      .patch("/api/invalid-url")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("invalid url");
      });
  });
  test("DELETE", () => {
    return request(app)
      .delete("/api/invalid-url")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("invalid url");
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
