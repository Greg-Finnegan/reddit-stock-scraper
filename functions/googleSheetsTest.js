import GoogleSheetsClient from "./googleSheetsClient.js";
import getFormattedDate from "./getFormattedDate.js";
const spreadsheetId = process.env.GOOGLE_SHEET_ID;
import chalk from "chalk";
import { JSONFile } from "lowdb/node";
import { Low } from "lowdb";
import { addRandomSuffix } from "pdf-lib";

/**
 * Reads a JSON database file for a specified timestamp and returns an array of stock data objects.
 *
 * The JSON file is expected to have an object with a property "results", which is an array of objects.
 * Each object in the "results" array contains:
 * - ticker {string}: The stock's ticker symbol (e.g., "GOOGL", "CRKN", "RVSN").
 * - company {string}: The company's name (e.g., "Alphabet Inc.", "Crown Electrokinetics Corp.", "Rail Vision Ltd.").
 * - occurrences {number}: The number of occurrences or mentions.
 * - sentiment {string}: The sentiment associated with the stock (e.g., "bullish").
 * - messaging {string[]}: An array of strings providing detailed commentary about the stock.
 *
 * @async
 * @function readDb
 * @returns {Array<Object>} A promise that resolves to an array of stock data objects.
 */
const readDb = async () => {
  const defaultData = { results: [] };
  const adapter = new JSONFile(`db-1739380654.json`);
  const db = new Low(adapter, defaultData);
  await db.read();
  // thow error if no data
  if (!db.data.results || db.data.results.length === 0) {
    throw new Error("No data found in the database.");
  }
  return db.data.results;
};

const transposeStockData = (data) => {
  const header = [
    "Name",
    "Ticker Symbol",
    "Occurrences",
    "Sentiment",
    "Messaging",
    "Subbreddit(s)",
    "Date of Scan",
    "Day 0 % Change",
    "Day 1 % Change",
    "Day 2 % Change",
    "Day 3 % Change",
    "Day 4 % Change",
    "Day 5 % Change",
    "Day 6 % Change",
    "Day 7 % Change",
  ];
  return [
    header,
    ...data.map((stock) => {
      const [month, day, year] = stock.dateOfScan.split("/");
      return [
        stock.company,
        stock.ticker,
        stock.occurrences,
        stock.sentiment,
        " - " + stock?.messaging?.join("\n - "),
        stock?.subreddit?.join("\n"),
        stock.dateOfScan,
        '=PercentageChange("' +
          stock.ticker +
          '", "' + 
          stock.dateOfScan +
          '")',
        '=PercentageChange("' +
          stock.ticker +
          '", "' + 
          `${day + 1}/${month}/${year}` +
          '")',
        '=PercentageChange("' +
          stock.ticker +
          '", "' + 
          `${day + 2}/${month}/${year}` +
          '")',
        '=PercentageChange("' +
          stock.ticker +
          '", "' + 
          `${day + 3}/${month}/${year}` +
          '")',
        '=PercentageChange("' +
          stock.ticker +
          '", "' + 
          `${day + 4}/${month}/${year}` +
          '")',
        '=PercentageChange("' +
          stock.ticker +
          '", "' + 
          `${day + 5}/${month}/${year}` +
          '")',
        '=PercentageChange("' +
          stock.ticker +
          '", "' + 
          `${day + 6}/${month}/${year}` +
          '")',
        '=PercentageChange("' +
          stock.ticker +
          '", "' + 
          `${day + 7}/${month}/${year}` +
          '")',
      ];
    }),
  ];
};

async function printNamesAndMajors() {
  const data = await readDb();
  try {
    const sheetsClient = await GoogleSheetsClient.create();
    const title = addRandomSuffix(getFormattedDate());
    const newsheet = await sheetsClient.createNewSheet(spreadsheetId, title);
    const values = transposeStockData(data);
    await sheetsClient.appendValues(spreadsheetId, title, values);
  } catch (error) {
    console.error("Error in printNamesAndMajors:", error.message);
    if (error.response) {
      console.error("API Error Details:", error.response.data);
    }
  } finally {
    console.log(chalk.green("Google Sheets API called successfully."));
  }
}

// Execute the example
printNamesAndMajors();
