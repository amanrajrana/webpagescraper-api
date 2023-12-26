const express = require("express");
const cors = require("cors");
const { handleAllPageScraper } = require("./controllers/allPageScraper");
const { handleSinglePageScraper } = require("./controllers/singlePageScraper");
const { handleTrainer } = require("./controllers/openaiTrainer");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors());

app.get("/api/scrape/multi-url", handleAllPageScraper);
app.get("/api/scrape/single-url", handleSinglePageScraper);
app.post("/api/trainer", handleTrainer);

module.exports = app;
