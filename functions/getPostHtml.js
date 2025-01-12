/* eslint-disable import/extensions */
import fetch from "node-fetch";
import BASE_URL from "../api/api.js";
import ERROR_MESSAGE from "../data/errorMessage.js";

const getPostHtml = async (hrefArr) => {
  let htmlToParse = "";

  for (const href of hrefArr) {
    try {
      const postResponse = await fetch(`${BASE_URL}${href}`);
      const postHTML = await postResponse.text();

      htmlToParse += postHTML;

      console.log("Loading HTML...");
    } catch (error) {
      if (error) console.log(ERROR_MESSAGE);
    }
  }

  return htmlToParse;
};

export default getPostHtml;
