import axios from "axios";
import * as cheerio from "cheerio";
import express from "express";
const app = express();
const port = 3000;

app.use(express.json());

const getText = async (url) => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Extract all text content
    const allText = [];

    $("body").each((index, element) => {
      const text = $(element).text();
      allText.push(text);
    });

    return allText.join(" ").length;
  } catch (error) {
    console.log({ domain: url, error: error.message });
    return 0;
  }
};

app.post("/scrape", async (req, res) => {
  const domain = "cheerio.js.org";

  try {
    const html = await axios.get(`https://${domain}`);
    const $ = cheerio.load(html.data);

    const baseUrl = new URL(`https://${domain}`);

    const urls = [baseUrl];
    const characterCounts = {};

    // Extract URLs and character counts
    $("a").each((index, element) => {
      const href = $(element).attr("href");
      if (href) {
        if (href === "/" || href === "#" || href === "/#") {
          return;
        }

        const url = new URL(href, baseUrl);

        // Check if the URL belongs to the specified domain
        if (url.hostname === baseUrl.hostname) {
          urls.push(url.href);
        }
      }
    });

    // Get character counts
    for (const url of urls) {
      const characterCount = await getText(url);
      characterCounts[url] = characterCount;
    }

    res.json({ characterCounts });
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
