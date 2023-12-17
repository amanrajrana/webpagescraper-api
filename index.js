import express from "express";
import cors from "cors";
import { handleWebpageScrape } from "./controllers/webpageScraper.js";
import { scrapeWebsiteViaSiteMap } from "./controllers/siteMapScraper.js";
import { getText } from "./controllers/scraper.js";

const app = express();
const port = 4002;

app.use(express.json());
app.use(cors());

app.post("/api/scrape/plain-url", handleWebpageScrape);
app.post("/api/scrape/sitemap-url", scrapeWebsiteViaSiteMap);
app.get("/api/scrape/single-url", getText);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
