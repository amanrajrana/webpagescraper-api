import axios from "axios";
import * as cheerio from "cheerio";

export const handleSinglePageScraper = async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ url: "Domain is required" });
  }

  if (!(url.includes("http://") || url.includes("https://"))) {
    return res
      .status(400)
      .json({ error: "Domain can only start with http:// or https://" });
  }

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    $("style").remove();
    $("script").remove();
    $("[style]").removeAttr("style");

    return res.send({
      title: $("title").text(),
      content: $("body").text().replace(/\s+/g, " ").trim(),
    });
  } catch (error) {
    return res.status(500).json({ error: error.toString() });
  }
};
