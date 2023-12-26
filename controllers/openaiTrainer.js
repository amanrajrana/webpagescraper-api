const { handleFileUpload } = require("../utils/uploadFileToOpenAI");
const path = require("path");
const fs = require("fs");
const { createWriteStream } = fs;
const fsPromises = fs.promises;

const handleTrainer = async (req, res) => {
  const { content } = req.body;

  if (!content || !Array.isArray(content) || content.length === 0) {
    return res.status(400).json({ error: "Content is required" });
  }

  let filePath = ""; // File path to be used for writing and uploading

  try {
    const hostname = new URL(content[0].url).hostname; // Get hostname from first URL to use as filename

    filePath = path.join(__dirname, "..", "temp", `${hostname}.txt`); // Create file path
    const writeStream = createWriteStream(filePath); // Create write stream

    content.forEach((item, index) => {
      // Check item has required properties
      if (!item?.title || !item?.content) {
        throw new Error(
          `Item at index ${index} is missing required properties, title and/or content`
        );
      }

      const txtFileContent =
        "Title: " + item.title + "\n\n" + item.content + "\n\n\n\n";
      writeStream.write(txtFileContent);
    });

    writeStream.end();
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  try {
    const response = await handleFileUpload(filePath); // Upload the file to OpenAI
    console.log("this is running");
    await fsPromises.unlink(filePath); // Delete the file after uploading

    return res.status(200).send(response);
  } catch (error) {
    // Delete the file if there is an error
    await fsPromises.unlink(filePath);
    console.log(error);

    return res.status(500).json({ error: error.message });
  }
};

module.exports = { handleTrainer };
