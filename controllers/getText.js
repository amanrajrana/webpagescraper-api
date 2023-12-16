import axios from "axios";
import * as cheerio from "cheerio";

export const getText = async (baseUrl, urls, url) => {
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
      url,
    };
  } catch (error) {
    return {};
  }
};
