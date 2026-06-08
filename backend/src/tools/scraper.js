import { getJson } from "serpapi";
//engine: "google",
export async function executeSearch(item) {
  console.log(`[Agent Tool] Initiating live web retrieval for: ${item}`);
  try {
    const response = await getJson({
      engine: "ebay",
      _nkw: item,
      ebay_domain: "ebay.com",
      api_key: process.env.SERPAPI_API_KEY,
    });

    const amazonResponse = await getJson({
      engine: "amazon",
      amazon_domain: "amazon.in", // Targets Amazon India
      k: item,
      api_key: process.env.SERPAPI_API_KEY.trim(),
    });

    const amazonResults = amazonResponse.organic_results || [];
    const flipkartResults = response.organic_results || [];

   //const searchResults = response.organic_results || [];

    // Map through results to keep titles, snippets, AND images
    const amazonContext = amazonResults.length > 0?
      //.filter(result => result.link.includes("amazon.in"))
      amazonResults.slice(0, 2)
      .map(r => {
            const title = r.title || "Product Option";
            const snippet = r.snippet || r.description || "View product page for information details.";
            const img = r.thumbnail || "";
            return `Title: ${title}, Info: ${snippet}, ImgUrl: ${img}`;
          }) .join("\n"):"No live listings found on Amazon.";

    const flipkartContext = flipkartResults.length>0
      //.filter(result => result.link.includes("flipkart.com"))
      ?flipkartResults.slice(0, 2)
      .map(r => {
            const title = r.title || "Product Option";
            const snippet = r.snippet || "View product page for information details.";
            // Google organic results attach the thumbnail image inside r.thumbnail
            const img = r.thumbnail || ""; 
            return `Title: ${title}, Info: ${snippet}, ImgUrl: ${img}`;
          })
          .join("\n") :"No live listings found on Flipkart.";

    return {
      amazonRaw: amazonContext ,
      flipkartRaw: flipkartContext
    };
  } catch (error) {
    console.error("[Scraper Error]", error);
    return { amazonRaw: "", flipkartRaw: "" };
  }
}