# Reddit Stock Scraper

A Node.js-powered tool to fetch and analyze the most discussed stocks on any given subreddit. This tool uses Reddit to gather posts, identifies trending stock mentions, and generates insights based on community activity. Perfect for monitoring financial subreddits like r/wallstreetbets, r/stocks, or any subreddit you choose!

- ESLint (to enforce code quality)
- Node-Fetch (for fetching the data)
- Prompt (to get user input for custom/dynamic results)
- OpenAi - experimental use of o1 mini to get stock info and sentiment
- lowDB - Simple and fast JSON database - created on runs where multiple subreddits are scanned - combines the duplicates in feed.

![Screenshot 2025-01-13 at 10 41 31 AM](https://github.com/user-attachments/assets/3be70ece-c121-4d97-8486-f63471edd53e)

## Manual Reddit Scraper
###function name: manualRedditScraper

### Prompts the User
- Asks for a subreddit and the number of results to display.
- Lets users choose from predefined subreddit options or enter a custom subreddit name.

### Fetches Data from Reddit
- Retrieves the latest posts from the specified subreddit using the Reddit API.

### Processes Post Content
- Extracts text content from the posts.
- Identifies stock tickers mentioned in the posts (e.g., `$AAPL`, `MSFT`) using a pattern-matching algorithm.

### Filters and Counts Tickers
- Removes invalid or irrelevant tickers from the list.
- Counts how many times each ticker is mentioned and sorts them by popularity.

### Displays Results
- Shows the top-mentioned stock tickers based on the user's input.

---

## Automated Reddit Scraper
###function name: automatedRedditScraper
### runs by default with `npm run start`


### Scrapes Multiple Subreddits
- Automatically fetches data from a predefined list of subreddits, such as `stocks`, `pennystocks`, and `wallstreetbets`.

### Analyzes Data Using OpenAI
- Sends the extracted text content to OpenAI for sentiment analysis or further processing.
- Groups the data by ticker symbols and adds metadata like sentiment and subreddits where the ticker was mentioned.

### Combines Results
- Merges results across subreddits:
  - Combines duplicate mentions of the same ticker.
  - Consolidates sentiments (marks as "mixed" if conflicting).
  - Ensures messaging and subreddit data are deduplicated.

### Writes to a Database
- Saves the processed and combined results into a JSON file with a timestamped name.

### Displays a Completion Message
- Notifies the user when the scraping and data processing are complete.


## Usage

Make sure you have [Node.js](https://nodejs.org/en/) installed first.

Clone the repo and and a `.env` file that has `OPENAI_API_KEY='your-api-key-here'`

`npm install`

`npm run start`

By default, that's it. It can do more, but that is the easiest way to get started.
