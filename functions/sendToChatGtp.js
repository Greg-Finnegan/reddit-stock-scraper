import OpenAI from "openai";

const openAiApiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey: openAiApiKey });

const fetchFromOpenAI = async (userInputText) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "developer",
          content:
            "You extract all companies/tickers mentioned into JSON data with a ‘sentiment’ field that is either bullish or bearish.",
        },
        {
          role: "user",
          content: userInputText,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "ticker_extraction",
          schema: {
            type: "object",
            properties: {
              results: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    ticker: { type: "string" },
                    company: { type: "string" },
                    occurrences: { type: "number", description: "The number of times the ticker/company was mentioned." },
                    sentiment: {
                      type: "string",
                      enum: ["bullish", "bearish"],
                    },
                    messaging: {
                      items: { type: "string" },
                      type: "array",
                      description: "The messaging that the AI used to determine the sentiment.",
                    },
                  },
                  required: ["ticker", "company", "occurrences", "sentiment"],
                  additionalProperties: false,
                },
              },
            },
            required: ["results"],
            additionalProperties: false,
          },
        },
      },
    });
    return JSON.parse(response.choices[0]?.message?.content);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export default fetchFromOpenAI;
