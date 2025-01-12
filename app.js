/* eslint-disable import/extensions */
// packages
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import fetch from "node-fetch";
import prompt from "prompt";

// api
import BASE_URL from "./api/api.js";
// data
import ERROR_MESSAGE from "./data/errorMessage.js";
import invalidTickers from "./data/invalidTickers.js";

// functions
import getSelfTexts from "./functions/formatRedditJsonResponse.js";
import fetchFromOpenAI from "./functions/sendToChatGtp.js";
// import getFormattedDate from "./functions/getFormattedDate.js";

// test
// import testCompletion from "./test/testOpenAiConnection.js";

// eslint-disable-next-line no-unused-vars
const manualRedditScraper = async () => {
  // start user prompt/input
  prompt.start();

  // subreddit map
  const subredditMap = {
    1: "StockMarket",
    2: "investing",
    3: "stocks",
    4: "wallstreetbets",
    5: "Canadapennystocks",
    6: "pennystocks",
  };

  // get userInput
  const { subreddit: subredditInput, numberOfResults } = await prompt.get([
    "subreddit",
    "numberOfResults",
  ]);

  // translate number to subreddit name if necessary
  const subreddit = subredditMap[subredditInput] || subredditInput;

  try {
    const response = await fetch(`${BASE_URL}/r/${subreddit}.json`, {
      method: "GET",
      headers: {
        "User-Agent": "MyApp/1.0",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json(); // Process the response body as JSON

    // call the getSelfTexts fn
    const selfTexts = getSelfTexts(data);

    const ai = await fetchFromOpenAI(selfTexts);
    console.log("open Ai", ai);

    // ticker regex
    const regex = /\$?\b[A-Z]{1,4}\b/g;

    // extract all tickers matching the regex
    // this is including duplicates, as we want to count them later
    const tickers = selfTexts
      .match(regex)
      .sort()
      .map((ticker) => ticker.replace("$", ""))
      .filter((ticker) => invalidTickers.indexOf(ticker) < 0);

    // object structure {stock: "TICKER_NAME_HERE", timesCounted: 1 }
    const countedTickers = [];

    tickers.forEach((ticker) => {
      // if not found...
      if (!countedTickers.filter((match) => match.stock === ticker).length) {
        // add it to array
        countedTickers.push({ stock: ticker, timesCounted: 1 });
      } else {
        // if already in the array, just increase timesCounted by 1
        countedTickers.find((dupe) => dupe.stock === ticker).timesCounted += 1;
      }
    });

    // sort tickers by timesCounted (highest to lowest)
    const sortedTickers = countedTickers.sort((tickerA, tickerB) =>
      tickerA.timesCounted < tickerB.timesCounted ? 1 : -1
    );

    // grab the top tickers, based on user input
    const topTickers = sortedTickers.splice(0, +numberOfResults);

    // display final output to the user
    console.log(
      `Top ${+numberOfResults} Mentioned Tickers from /r/${subreddit}: `,
      topTickers
    );
  } catch (error) {
    if (error) console.log(ERROR_MESSAGE);
  }
};

// eslint-disable-next-line no-unused-vars
const automatedRedditScraper = async () => {
  // Setup lowdb to dump data from OpenAI
  const defaultData = { results: [] };
  // const today = getFormattedDate();
  const currentTimestamp = Math.floor(Date.now() / 1000); // Unix timestamp
  const adapter = new JSONFile(`db-${currentTimestamp}.json`);
  const db = new Low(adapter, defaultData);

  await db.read();
  db.data = db.data || { results: [] };

  const subredditArray = ["stocks", "investing"];

  for (const subreddit of subredditArray) {
    try {
      const response = await fetch(`${BASE_URL}/r/${subreddit}.json`, {
        method: "GET",
        headers: {
          "User-Agent": "MyApp/1.0",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json(); // Process the response body as JSON

      // Call the getSelfTexts function
      const selfTexts = getSelfTexts(data);

      const aiResponse = await fetchFromOpenAI(selfTexts);

      // 'results' are pushed to the database
      if (Array.isArray(aiResponse.results)) {
        db.data.results.push(...aiResponse.results);
      }

      await db.write(); // Save the updated database
    } catch (error) {
      console.log(error.message || ERROR_MESSAGE);
    }
  }
};

automatedRedditScraper();

// test your connection to OpenAI
// testCompletion();

/*
	--- stock/investing/trading subreddits ---
	CanadianInvestor (CA)
	investing (US)
	stocks (US)
	wallstreetbets (US)

	Canadapennystocks (CA)
	pennystocks (US)
*/
