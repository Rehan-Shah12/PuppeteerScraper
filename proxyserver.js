const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const httpProxy = require("http-proxy-middleware");

const app = express();
const port = 6000;

app.use(bodyParser.json());

// create proxy middlewares that forward requests to the target servers
const proxy1 = httpProxy.createProxyMiddleware({
  target: "http://localhost:3000",
  changeOrigin: true,
});

const proxy2 = httpProxy.createProxyMiddleware({
  target: "http://localhost:4000",
  changeOrigin: true,
});

const proxy3 = httpProxy.createProxyMiddleware({
  target: "http://localhost:5000",
  changeOrigin: true,
});

// handle the /search endpoint by forwarding the request to all three proxies
app.post("/search", (req, res) => {
  // send the request to each proxy asynchronously
  Promise.all([proxy1(req, res), proxy2(req, res), proxy3(req, res)]).then(
    () => {
      // once all proxies have responded, send a response to the client
      res.status(200).send("OK");
    }
  );
});

// listen for requests on port 6000
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
