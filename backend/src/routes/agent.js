import express from 'express';
import { OpenAI } from 'openai';
import { executeSearch } from '../tools/scraper.js';

const router = express.Router();

//console.log("Raw Key Value:", process.env.OPENAI_API_KEY);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY.trim() });

router.post('/api/compare', async (req, res) => {
  // Ensure we safely destructure the fields provided by your dynamic frontend input boxes
  const { item, targetSpecs } = req.body; 

  if (!item || !targetSpecs) {
    return res.status(400).json({ error: "Missing required product name or specification fields." });
  }

  try {
    // 🪲 FIX 1: Explicitly await the live SerpAPI scraper and hold execution
    const liveEcomData = await executeSearch(item);
    console.log("liveEcomData ---- :", liveEcomData.amazonRaw);

    console.log(`[Agent Orchestrator] Live data safely retrieved for ${item}. Sending to OpenAI...`);

    // 🪲 FIX 2: Reconstruct a clean system prompt forcing structured adherence
    const systemInstruction = `You are a universal product evaluation engine. You handle any category: cars, bikes, electronics, grinders, appliances, etc.
          
Extract values matching these requested aspects: [${targetSpecs}].
CRITICAL: You must also create an aspect named "Product Image" as the first row, mapping the found "ImgUrl" from the dataset for each platform.

Your response must follow this strict JSON format architecture:
{
  "headers": ["Specification/Feature", "Amazon", "Ebay"],
  "rows": [
    {
      "specName": "Product Image",
      "amazonValue": "Value extracted based on query",
      "flipkartValue": "Value extracted based on query"
    },
    {
      "specName": "Price",
      "amazonValue": "Value extracted based on query",
      "EbayValue": "Value extracted based on query"
    }
  ],
  "verdict": "Detailed shopping verdict."
}`;

    // 🪲 FIX 3: Run the Completion using JSON Mode execution
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', 
      response_format: { type: "json_object" },
      messages: [
        { role: 'system', content: systemInstruction },
        {
          role: 'user',
          content: `Analyze this dynamic raw data for the item "${item}".
          Filter and display metrics for these specific properties: "${targetSpecs}"
          
          CRITICAL INSTRUCTION FOR IMAGES: For the "Product Image" row, look closely at the "ImgUrl" parameter inside the datasets. You must copy the exact, unedited web address string (starting with http) directly into the value field. Do not summarize or alter the link.

          --- LIVE DATA DATASET ---
          ${JSON.stringify(liveEcomData)}
          -------------------------`
        }
      ],
      temperature: 0.2 // Low temperature ensures factual mapping instead of creative placeholders
    });

    // Parse the safe structured response back to your React frontend component
    const structuredMatrix = JSON.parse(completion.choices[0].message.content);
    //console.log(structuredMatrix)
    return res.status(200).json(structuredMatrix);

  } catch (error) {
    console.error("Agent Processing Exception:", error);
    return res.status(500).json({ error: 'Agent failed to map evaluation matrix securely.' });
  }
});

export default router;



// import express from 'express';
// import { OpenAI } from 'openai';
// import { executeSearch } from '../tools/scraper.js';

// const router = express.Router();
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY.trim() });

// router.post('/api/compare', async (req, res) => {
//   const { item, targetSpecs } = req.body;

//   try {
//     const liveEcomData = await executeSearch(item);

//     // 🚀 Improved System Instructions with explicit rule structures
//     const systemInstruction = `You are a universal product evaluation data extraction engine.
//     Analyze the provided raw e-commerce search dataset and organize metrics matching the user requested parameters.
    
//     CRITICAL PROMPT LAWS:
//     1. The very first entry in the rows dataset array must have a specName of exactly "Product Image".
//     2. Extract the unedited, full raw 'ImgUrl' string from the provided data package into the image row fields.
//     3. If an image or text spec value does not exist in the provided text dataset, use the string "N/A". Never hallucinate a link.`;

//     // 🔒 Define the rigid Schema contract your React table expects
//     const responseSchema = {
//       name: "comparison_matrix",
//       strict: true, // Forces absolute compliance to this layout
//       schema: {
//         type: "object",
//         properties: {
//           headers: {
//             type: "array",
//             items: { type: "string" },
//             description: "An array representing table headers, e.g. ['Specification/Feature', 'Amazon', 'Flipkart']"
//           },
//           rows: {
//             type: "array",
//             items: {
//               type: "object",
//               properties: {
//                 specName: { type: "string" },
//                 amazonValue: { type: "string" },
//                 flipkartValue: { type: "string" }
//               },
//               required: ["specName", "amazonValue", "flipkartValue"],
//               additionalProperties: false
//             }
//           },
//           verdict: { 
//             type: "string", 
//             description: "A summary advising the user on which platform is optimal based on price and features." 
//           }
//         },
//         required: ["headers", "rows", "verdict"],
//         additionalProperties: false
//       }
//     };

//     // Execute the completions call using the strict json_schema framework
//     const completion = await openai.chat.completions.create({
//       model: 'gpt-4o',
//       response_format: { 
//         type: "json_schema", 
//         json_schema: responseSchema // 👈 Passes the schema contract to the LLM core
//       },
//       messages: [
//         { role: 'system', content: systemInstruction },
//         {
//           role: 'user',
//           content: `Analyze this raw marketplace search payload for the item "${item}".
//           Target features to isolate: "${targetSpecs}"
          
//           --- LIVE DATA DATASET ---
//           ${JSON.stringify(liveEcomData)}
//           -------------------------`
//         }
//       ],
//       temperature: 0.1 // Kept low to maximize precision mapping
//     });

//     const structuredMatrix = JSON.parse(completion.choices[0].message.content);
//     return res.status(200).json(structuredMatrix);

//   } catch (error) {
//     console.error("Agent Routing Exception:", error);
//     return res.status(500).json({ error: 'Failed to process matrix format' });
//   }
// });

// export default router;