# Reddit Stock Scraper

A Node.js-powered tool to fetch and analyze the most discussed stocks on any given subreddit. This tool uses Reddit to gather posts, identifies trending stock mentions, and generates insights based on community activity. Perfect for monitoring financial subreddits like r/wallstreetbets, r/stocks, or any subreddit you choose!

- ESLint (to enforce code quality)
- Node-Fetch (for fetching the data)
- Prompt (to get user input for custom/dynamic results)
- OpenAi - experimental use of o1 mini to get stock info and sentiment
- lowDB - Simple and fast JSON database - created on runs where multiple subreddits are scanned - TODO combines the duplicates in feed and enriches data with price data.

## Usage

Make sure you have [Node.js](https://nodejs.org/en/) installed first.

`npm install`

`npm run start`

Then simply enter in the subreddit name you wish to scrape (case sensitive), and the number of results you want.

And that's it!
