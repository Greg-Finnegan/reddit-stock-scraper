import fs from "fs/promises";
import path from "path";
import process from "process";
import { authenticate } from "@google-cloud/local-auth";
import { google } from "googleapis";

class GoogleSheetsClient {
  // eslint-disable-next-line
  constructor({ authClient, tokenPath, credentialsPath, scopes }) {
    this.authClient = authClient;
    this.tokenPath = tokenPath;
    this.credentialsPath = credentialsPath;
    this.scopes = scopes;
  }

  static async create(options = {}) {
    const {
      tokenPath = path.join(process.cwd(), "token.json"),
      credentialsPath = path.join(
        process.cwd(),
        "functions/google_credentials.json"
      ),
      scopes = ["https://www.googleapis.com/auth/spreadsheets"],
    } = options;

    let authClient = await this.loadSavedCredentialsIfExist(tokenPath);

    if (!authClient) {
      authClient = await authenticate({
        scopes,
        keyfilePath: credentialsPath,
      });

      if (authClient.credentials) {
        await this.saveCredentials(authClient, tokenPath, credentialsPath);
      }
    }

    return new GoogleSheetsClient({
      authClient,
      tokenPath,
      credentialsPath,
      scopes,
    });
  }

  static async loadSavedCredentialsIfExist(tokenPath) {
    try {
      const content = await fs.readFile(tokenPath);
      const credentials = JSON.parse(content);
      return google.auth.fromJSON(credentials);
    } catch (err) {
      return null;
    }
  }

  static async saveCredentials(client, tokenPath, credentialsPath) {
    const content = await fs.readFile(credentialsPath);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
      type: "authorized_user",
      client_id: key.client_id,
      client_secret: key.client_secret,
      refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(tokenPath, payload);
  }

  async getSpreadsheetValues(spreadsheetId, range) {
    const sheets = google.sheets({ version: "v4", auth: this.authClient });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    return res.data.values;
  }

  // Add new methods here
  async appendValues(spreadsheetId, range, values) {
    const sheets = google.sheets({ version: "v4", auth: this.authClient });
    const res = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: { values },
    });
    return res.data;
  }

  async createNewSheet(spreadsheetId, title) {
    const sheets = google.sheets({ version: "v4", auth: this.authClient });
    const res = await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title,
              },
            },
          },
        ],
      },
    });
    return res.data;
  }

  // Example of another potential method
  async updateValues(spreadsheetId, range, values) {
    const sheets = google.sheets({ version: "v4", auth: this.authClient });
    const res = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: { values },
    });
    return res.data;
  }
}

export default GoogleSheetsClient;
