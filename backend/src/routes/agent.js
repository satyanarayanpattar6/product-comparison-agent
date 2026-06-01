import express from 'express';
import { OpenAI } from 'openai';
import { executeSearch } from '../tools/scraper.js';

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/api/compare', async (req, res) => {
  // Ensure we safely destructure the fields provided by your dynamic frontend input boxes
  const { item, targetSpecs } = req.body; 

  if (!item || !targetSpecs) {
    return res.status(400).json({ error: "Missing required product name or specification fields." });
  }

  try {
    // 🪲 FIX 1: Explicitly await the live SerpAPI scraper and hold execution
    const liveEcomData = await executeSearch(item);

    console.log(`[Agent Orchestrator] Live data safely retrieved for ${item}. Sending to OpenAI...`);

    // 🪲 FIX 2: Reconstruct a clean system prompt forcing structured adherence
    const systemInstruction = `You are an advanced E-commerce Data Extraction Agent. 
    Your strict objective is to look ONLY at the provided raw search engine context data for Amazon and Flipkart and extract information matching the user's requested features.

    Requested Specifications to compare: [${targetSpecs}]

    Rules:
    1. Extract absolute data points from the text. If an aspect is completely missing from the raw snippet, write "Not specified in live listing".
    2. Do NOT use placeholder values like "Intel Core i7" or "$899" unless they explicitly appear in the provided payload text below.
    3. Generate a definitive "verdict" string based strictly on the prices and features found.

    Your response must match this exact JSON architecture:
    {
      "headers": ["Specification/Feature", "Amazon", "Flipkart"],
      "rows": [
        {
          "specName": "Price",
          "amazonValue": "Value extracted from Amazon data",
          "flipkartValue": "Value extracted from Flipkart data"
        }
      ],
      "verdict": "Clear purchase reasoning string."
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
          
          --- LIVE DATA DATASET ---
          ${JSON.stringify(liveEcomData)}
          -------------------------`
        }
      ],
      temperature: 0.2 // Low temperature ensures factual mapping instead of creative placeholders
    });

    // Parse the safe structured response back to your React frontend component
    const structuredMatrix = JSON.parse(completion.choices[0].message.content);
    return res.status(200).json(structuredMatrix);

  } catch (error) {
    console.error("Agent Processing Exception:", error);
    return res.status(500).json({ error: 'Agent failed to map evaluation matrix securely.' });
  }
});

export default router;