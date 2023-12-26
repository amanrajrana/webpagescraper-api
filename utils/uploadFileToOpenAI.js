const OpenAI = require("openai");
const fs = require("fs");
const fsPromises = fs.promises;

const handleFileUpload = async (filePath) => {
  // Check fileContent is passed and is a readable stream
  if (!filePath) {
    throw new Error(`filePath is required`);
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OpenAI API key is required");

  const openai = new OpenAI({ apiKey });

  let assistantId;
  let assistantDetails = {};
  const assistantFilePath = "./assistant.json";

  // Check if the assistant.json file exists
  try {
    const assistantData = await fsPromises.readFile(assistantFilePath, "utf8");

    assistantDetails = JSON.parse(assistantData);
    assistantId = assistantDetails.assistantId;
  } catch (error) {
    // If file does not exist or there is an error in reading it, create a new assistant
    console.log("No existing assistant detected, creating new.\n");
    const assistantConfig = {
      name: "Blog Assistant",
      instructions: "You are my blog website assistant.",
      tools: [{ type: "retrieval" }],
      model: "gpt-3.5-turbo-1106",
    };

    const assistant = await openai.beta.assistants.create(assistantConfig);
    assistantDetails = { assistantId: assistant.id, ...assistantConfig };

    // Save the assistant details to assistant.json
    await fsPromises.writeFile(
      assistantFilePath,
      JSON.stringify(assistantDetails, null, 2)
    );
    assistantId = assistantDetails.assistantId;
  }

  console.log("Uploading file to OpenAI...\n");

  // Upload the file
  const file = await openai.files.create({
    file: fs.createReadStream(filePath),
    purpose: "assistants",
  });

  console.log("File uploaded successfully.\n");

  // Retrieve existing file IDs from assistant.json to not overwrite
  let existingFileIds = assistantDetails.file_ids || [];

  // Update the assistant with the new file ID
  await openai.beta.assistants.update(assistantId, {
    file_ids: [...existingFileIds, file.id],
  });

  console.log("Assistant updated successfully.\n");

  // Update local assistantDetails and save to assistant.json
  assistantDetails.file_ids = [...existingFileIds, file.id];
  await fsPromises.writeFile(
    assistantFilePath,
    JSON.stringify(assistantDetails, null, 2)
  );

  console.log("Assistant details saved successfully.\n");

  return { message: "File uploaded successfully" };
};

module.exports = { handleFileUpload };
