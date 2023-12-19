import express from "express";
import cors from "cors";
import { handleAllPageScraper } from "./controllers/allPageScraper.js";
import { handleSinglePageScraper } from "./controllers/singlePageScraper.js";

const app = express();
const port = 4002;

app.use(express.json());
app.use(cors());

app.get("/api/scrape/multi-url", handleAllPageScraper);
app.get("/api/scrape/single-url", handleSinglePageScraper);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
