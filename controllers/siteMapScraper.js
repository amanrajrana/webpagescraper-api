// This is sitemapScraper.js
import siteMapper from "sitemapper";
import { load } from "cheerio";
import axios from "axios";

// Extract text by removing some things, like HTML
function extractText(htmlContent) {
  const $ = load(htmlContent);
  $("style").remove();
  $("script").remove();
  $("[style]").removeAttr("style");
  return {
    content: (content = $("body").text().replace(/\s+/g, " ").trim()),
    title: $("title").text(),
  };
}

const fetchTextContent = async (url) => {
  try {
    const response = await axios.get(url);

    // Extract all text content
    const { content, title } = extractText(response.data);

    return {
      url,
      title,
      content,
      contentLength: content.length,
    };
  } catch (error) {
    return {};
  }
};

// Main function that orchestrates calling other functions and writing files
export const scrapeWebsiteViaSiteMap = async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ url: "url is required" });
  }

  //* Check url is sitemap or note
  if (!url.includes(".xml")) {
    return res.status(400).json({ error: "URL is not a sitemap" });
  }

  const sitemap = new siteMapper({ url });
  const { sites } = await sitemap.fetch();

  // Fetch all the sites in parallel
  const promises = sites.map((url) => fetchTextContent(url));
  const contents = await Promise.all(promises);

  return res.json(contents);
};
