/* eslint-disable import/extensions */
// packages

import fetch from "node-fetch";
import prompt from "prompt";

// api
import BASE_URL from "./api/api.js";

// data
import ERROR_MESSAGE from "./data/errorMessage.js";
import invalidTickers from "./data/invalidTickers.js";

// functions
import getSelfTexts from "./functions/formatRedditJsonResponse.js";

const scrapeReddit = async () => {
  // start user prompt/input
  prompt.start();

  // get userInput
  const { subreddit, numberOfResults } = await prompt.get([
    "subreddit",
    "numberOfResults",
  ]);

  try {
    const response = await fetch(`${BASE_URL}/r/${subreddit}.json?limit=500`, {
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

scrapeReddit();

/*
	--- stock/investing/trading subreddits ---
	CanadianInvestor (CA)
	investing (US)
	stocks (US)
	wallstreetbets (US)

	Canadapennystocks (CA)
	pennystocks (US)
*/
