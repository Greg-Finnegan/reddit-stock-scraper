import OpenAI from "openai";

const openAiApiKey = process.env.OPENAI_API_KEY;

// Create a new instance of the OpenAI class with your API key
const openai = new OpenAI({
  apiKey: openAiApiKey, // Replace with your actual API key
});

const testCompletion = async () => {
  console.log("Testing connection to OpenAI...");
  console.log("apiKey:", openAiApiKey);
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18",
      messages: [{ role: "user", content: "Say hello to the world!" }],
    });
    console.log(
      "Connection successful! Response:",
      response.choices[0].message.content
    );
  } catch (error) {
    console.error("Connection failed:", error);
  }
};

export default testCompletion;
