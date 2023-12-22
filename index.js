const express = require("express");
const cors = require("cors");
const { handleAllPageScraper } = require("./controllers/allPageScraper");
const { handleSinglePageScraper } = require("./controllers/singlePageScraper");

const app = express();

app.use(express.json());
app.use(cors());

app.get("/multi-url", handleAllPageScraper);
app.get("/single-url", handleSinglePageScraper);

module.exports = app;
