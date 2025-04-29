import GoogleSheetsClient from "./googleSheetsClient.js";

async function printNamesAndMajors() {
  try {
    // Create authenticated client
    const sheetsClient = await GoogleSheetsClient.create();

    // Spreadsheet ID that Google Sheets API uses for the example - pull from env in real use
    const spreadsheetId = "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms";
    const range = "Class Data!A2:E";

    // Get values using the class method
    const data = await sheetsClient.getSpreadsheetValues(spreadsheetId, range);

    // Process and display results 
    if (!data || data.length === 0) {
      console.log("No data found.");
      return;
    }

    console.log("Name, Major:");
    data.forEach((row) => {
      // Print columns A and E (indices 0 and 4) 
      console.log(`${row[0]}, ${row[4]}`);
    });
  } catch (error) {
    console.error("Error in printNamesAndMajors:", error.message);
    if (error.response) {
      console.error("API Error Details:", error.response.data);
    }
  }
}

// Execute the example
printNamesAndMajors();
