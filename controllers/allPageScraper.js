import axios from "axios";
import * as cheerio from "cheerio";

const getText = async (baseUrl, urls, url) => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    $("style").remove();
    $("script").remove();
    $("[style]").removeAttr("style");

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
      title: $("title").text(),
      content: $("body").text().replace(/\s+/g, " ").trim(),
      url,
    };
  } catch (error) {
    return {};
  }
};

export const handleAllPageScraper = async (req, res) => {
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
    const baseUrl = new URL(url);

    const urls = [url];
    const result = [];

    const content1 = await getText(baseUrl, urls, url);

    if (content1.content && content1.title) {
      result.push({
        title: content1.title,
        url,
        contentLength: content1.content.length,
        content: content1.content,
      });
    }

    let fetchingUrlsIndex = 0;

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
            contentLength: content.content.length,
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
};
