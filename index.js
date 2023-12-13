import express from "express";
import cors from "cors";
import { handleWebpageScrape } from "./controllers/webpageScraper.js";

const app = express();
const port = 4002;

app.use(express.json());
app.use(cors());

app.post("/api/scrape", handleWebpageScrape);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
