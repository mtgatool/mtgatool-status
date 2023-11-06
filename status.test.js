/* eslint-env jest */
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

var sslChecker = require("ssl-checker");

var https = require("https");

const URLS = ["mtgatool.com", "api.mtgatool.com", "app.mtgatool.com"];

describe("SSL Certificates", () => {
  test.each(URLS)("SSL Certificate for %p", async (url) => {
    await sslChecker(url)
      .then((res) => {
        // expect(res.valid).toBe(true);
        expect(res.daysRemaining).toBeGreaterThan(0);
      })
      .catch((err) => {
        throw new Error(err);
      });
  });
});

const httpGetAsync = (url) => {
  return new Promise((resolve, reject) => {
    https
      .get(url, function (res) {
        res.on("data", function (d) {
          resolve(res.statusCode);
        });
      })
      .on("error", function (e) {
        reject(e);
      });
  });
};

describe("HTTP Status", () => {
  test.each(URLS)("HTTP Status for %p", async (url) => {
    const statusCode = await httpGetAsync(`https://${url}/`).catch((err) => {
      throw new Error(err);
    });
    expect(statusCode).toBe(200);
  });
});
