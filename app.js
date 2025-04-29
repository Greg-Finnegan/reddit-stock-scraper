/* eslint-disable import/extensions */
// packages
// eslint-disable-next-line import/no-unresolved
import { Low } from "lowdb";
import chalk from "chalk";
// eslint-disable-next-line import/no-unresolved
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
import getFormattedDate from "./functions/getFormattedDate.js";

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

const automatedRedditScraper = async () => {
  const defaultData = { results: [] };
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const adapter = new JSONFile(`db-${currentTimestamp}.json`);
  const db = new Low(adapter, defaultData);

  await db.read();
  db.data ||= { results: [] }; // ensures db.data is defined with { results: [] }
  console.log(chalk.yellow("Fetching Reddit data..."));

  const subredditArray = [
    "stocks",
    "pennystocks",
    "wallstreetbets",
    "investing",
    "StockMarket",
    "StocksAndTrading",
    "TheRaceTo10Million",
    "Daytrading",
  ];

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

      const subredditData = await response.json(); // rename 'data' to 'subredditData'
  
      console.log(chalk.yellow(`Processing ${subreddit}...`));

      const selfTexts = getSelfTexts(subredditData);
      console.log(chalk.yellow("Sending to LLM for parsing..."));
      const aiResponse = await fetchFromOpenAI(selfTexts);
      const date = getFormattedDate();

      if (Array.isArray(aiResponse.results)) {
        // if aiResponse.results is an array add subreddits to each result
        const subredditMappedResults = aiResponse.results.map((obj) => ({
          ...obj,
          subreddit: [subreddit],
          dateOfScan: date,
        }));
        // push them directly into db.data.results
        db.data.results.push(...subredditMappedResults);
      }
    } catch (error) {
      console.log(error.message || ERROR_MESSAGE);
    }
  }

  // After the loop, do your combination logic once
  console.log(chalk.yellow("Cleaning up results..."));
  const combined = [];
  const currentResults = db.data.results;

  currentResults.forEach((item) => {
    const existing = combined.find(
      (entry) => entry.ticker === item.ticker || entry.company === item.company
    );

    if (existing) {
      // Sum up occurrences
      existing.occurrences += item.occurrences;

      // Check sentiment; if different, set to 'mixed'
      if (existing.sentiment !== item.sentiment) {
        existing.sentiment = "mixed";
      }

      // Merge messaging (avoid duplicates)
      item.messaging.forEach((msg) => {
        if (!existing.messaging.includes(msg)) {
          existing.messaging.push(msg);
        }
      });

      // Merge messaging (avoid duplicates)
      item.subreddit.forEach((subreddit) => {
        if (!existing.subreddit.includes(subreddit)) {
          existing.subreddit.push(subreddit);
        }
      });
    } else {
      combined.push({ ...item });
    }
  });

  // Sort by occurrences
  combined.sort((a, b) => b.occurrences - a.occurrences);

  // Write back to db
  db.data.results = combined;
  await db.write();

  console.log(chalk.yellow("Syncing DB to Google Sheets"));
  //const sheetsClient = await GoogleSheetsClient.create();

  console.log(
    chalk.green(`Scraping complete! ${combined.length} results written to db.`)
  );
};

automatedRedditScraper();


// test your connection to OpenAI
// testCompletion();

// const subredditArray = [
//   "stocks",
//   "pennystocks",
//   "wallstreetbets",
//   "investing",
//   "StockMarket",
//   "StocksAndTrading",
//   "TheRaceTo10Million",
// ];

/*
	--- stock/investing/trading subreddits ---
	CanadianInvestor (CA)
	investing (US)
	stocks (US)
	wallstreetbets (US)

	Canadapennystocks (CA)
	pennystocks (US)
*/
