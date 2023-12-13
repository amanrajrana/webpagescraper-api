import express from "express";
import cors from "cors";
import { getText } from "./webpageScraper.js";

const app = express();
const port = 4002;

app.use(express.json());
app.use(cors());

app.post("/api/scrape", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ url: "Domain is required" });
  }

  if (!(url.includes("http://") || url.includes("https://"))) {
    return res
      .status(400)
      .json({ error: "Domain can only start with http:// or https://" });
  }

  try {
    const baseUrl = new URL(url);

    const urls = [url];
    const result = [];

    const content1 = await getText(baseUrl, urls, url);
    if (content1.content && content1.title) {
      result.push({
        title: content1.title,
        url,
        contentLength: content1.content?.join(" ").length,
        content: content1.content,
      });
    }

    let fetchingUrlsIndex = 1;

    while (true) {
      const promises = urls.map((url, index) => {
        if (index <= fetchingUrlsIndex) {
          return;
        }

        fetchingUrlsIndex = index;
        return getText(baseUrl, urls, url);
      });

      const contents = await Promise.all(promises);

      // Push contents to result
      for (const content of contents) {
        if (content && content.content && content.title && content.url) {
          result.push({
            title: content.title,
            url: content.url,
            contentLength: content.content?.join(" ").length,
            content: content.content,
          });
        }
      }

      // Check if all urls have been fetched
      if (fetchingUrlsIndex === urls.length - 1) {
        break;
      }
    }

    return res.status(200).send(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
