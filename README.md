# Reddit Stock Scraper

A Node.js-powered tool to fetch and analyze the most discussed stocks on any given subreddit. This tool uses Reddit to gather posts, identifies trending stock mentions, and generates insights based on community activity. Perfect for monitoring financial subreddits like r/wallstreetbets, r/stocks, or any subreddit you choose!

- ESLint (to enforce code quality)
- Node-Fetch (for fetching the data)
- Prompt (to get user input for custom/dynamic results)
- OpenAi - experimental use of o1 mini to get stock info and sentiment
- lowDB - Simple and fast JSON database - created on runs where multiple subreddits are scanned - combines the duplicates in feed.

![Screenshot 2025-01-13 at 10 41 31 AM](https://github.com/user-attachments/assets/3be70ece-c121-4d97-8486-f63471edd53e)


## Usage

Make sure you have [Node.js](https://nodejs.org/en/) installed first.

Clone the repo and and a `.env` file that has `OPENAI_API_KEY='your-api-key-here'`

`npm install`

`npm run scrape`

Then simply enter in the subreddit name you wish to scrape (case sensitive), and the number of results you want.

And that's it!
