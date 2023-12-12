import axios from "axios";
import * as cheerio from "cheerio";
import express from "express";
const app = express();
const port = 3000;

app.use(express.json());

const getText = async (baseUrl, urls, url) => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Extract all text content
    const content = [];

    $("body").each((index, element) => {
      const text = $(element).text();
      content.push(text);
    });

    const title = $("title").text();

    //* Extract all href links
    $("a").each((index, element) => {
      const href = $(element).attr("href");
      if (href) {
        // Check if the URL is not a hash link or query string
        if (!(href.includes("#") || href.includes("?") || href == "/")) {
          const url = new URL(href, baseUrl);

          // Check if the URL belongs to the specified domain
          if (url.hostname === baseUrl.hostname) {
            // Check if the URL is not already in the list
            if (!urls.includes(url.href)) {
              urls.push(url.href); // Add the URL to the list
            }
          }
        }
      }
    });

    return {
      title,
      content,
    };
  } catch (error) {
    return 0;
  }
};

app.post("/scrape", async (req, res) => {
  const { domain } = req.body;

  if (!domain) {
    return res.status(400).json({ error: "Domain is required" });
  }

  if (!(domain.includes("http://") || domain.includes("https://"))) {
    return res
      .status(400)
      .json({ error: "Domain should not contain http or https" });
  }

  try {
    const baseUrl = new URL(domain);

    const urls = [domain];
    const result = [];

    // Get character counts
    for (const url of urls) {
      const content = await getText(baseUrl, urls, url);
      result.push({
        title: content.title || "Page not found",
        url,
        contentLength: content.content?.join(" ").length,
      });
    }

    res.status(200).send(result);
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
