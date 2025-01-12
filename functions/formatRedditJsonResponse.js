/**
 * Extracts the 'selftext' from each child object in the
 * provided JSON and concatenates them into a single string.
 *
 * @param {Object} jsonObj - The JSON object containing the 'children' array.
 * @returns {string} A single string containing all 'selftext' contents.
 */
function getSelfTexts(jsonObj) {
  // Check if the input is an object and has the required structure
  if (
    typeof jsonObj !== "object" ||
    jsonObj === null ||
    jsonObj.kind !== "Listing" ||
    !jsonObj.data ||
    !Array.isArray(jsonObj.data.children)
  ) {
    throw new Error("Invalid JSON structure");
  }

  // Use map to extract 'selftext' from each child and join them into a single string
  const selfTexts = jsonObj.data.children
    .map((child, index) => {
      if (
        typeof child !== "object" ||
        child === null ||
        child.kind !== "t3" || // Assuming 't3' is the kind for posts
        !child.data ||
        typeof child.data.selftext !== "string"
      ) {
        console.warn(`Child at index ${index} is missing 'selftext'`);
        return ""; // Return an empty string or handle as needed
      }
      return child.data.title + child.data.selftext;
    })
    .join(" "); // Join all selftext contents with a space

  return selfTexts;
}

export default getSelfTexts;
