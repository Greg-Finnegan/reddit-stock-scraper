import OpenAI from "openai";

const openAiApiKey = process.env.OPENAI_API_KEY;

// Create a new instance of the OpenAI class with your API key
const openai = new OpenAI({
  apiKey: openAiApiKey, // Replace with your actual API key
});

const fetchFromOpenAI = (userInputText) => {
  openai.chat.completions
    .create({
      model: "gpt-4o-mini-2024-07-18",
      messages: [
        {
          role: "developer",
          content:
            "You extract companies and tickers addresses into JSON data.",
        },
        {
          role: "user",
          content: userInputText,
        },
      ],
      response_format: {
        // See /docs/guides/structured-outputs
        type: "json_schema",
        json_schema: {
          name: "ticker_extraction",
          schema: {
            type: "object",
            properties: {
              ticker: {
                type: "string",
                description: "The stock ticker symbol of the company.",
              },
              company: {
                type: "string",
                description:
                  "The name of the company associated with the ticker.",
              },
              occurrences: {
                type: "number",
                description:
                  "The number of times the ticker or company name appears in the provided text.",
              },
            },
            required: ["ticker", "company", "occurrences"],
            additionalProperties: false,
          },
        },
      },
    })
    .then((response) => {
      console.log(response.choices[0].message.content);
      return response.choices;
    })
    .catch((error) => {
      console.log(error);
    });
};

export default fetchFromOpenAI;
