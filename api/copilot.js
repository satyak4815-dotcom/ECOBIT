import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { prompt, context, previousInteractionId } = req.body;

  if (!prompt || !context) {
    return res.status(400).json({ success: false, error: 'Missing prompt or context' });
  }

  // GEMINI API KEY FROM SERVER ENVIRONMENT
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.log('[Copilot] GEMINI_API_KEY: MISSING');
    return res.status(503).json({ success: false, error: 'GEMINI_API_KEY is missing' });
  }

  console.log('[Copilot] GEMINI_API_KEY: FOUND');
  console.log(`[Copilot] Dataset context: ${context ? 'FOUND' : 'MISSING'}`);

  try {
    const systemInstruction = `
      You are ECOBIT Copilot, an AI sustainability analyst. You are chatting with a user about their company's ESG performance.
      
      CRITICAL INSTRUCTIONS:
      1. You MUST use the provided VERIFIED DATASET CONTEXT to answer the user's question.
      2. DO NOT invent, hallucinate, or guess any company data. If a specific metric is not available in the context, explicitly state: "I don't have verified data for this metric."
      3. If the user asks for calculations or scenarios (e.g., ROI, Payback, Carbon Tax), use the exact calculations provided in the context if available. If they ask a hypothetical that requires the What-If Simulator, provide a qualitative answer and recommend they use the Simulator.
      4. Distinguish between Verified Data, Calculated Metrics, and AI Explanations.
      5. Keep responses concise and easy to scan.

      OUTPUT FORMAT:
      You MUST output a valid JSON object matching this EXACT schema:
      {
        "summary": "A concise, 1-2 sentence direct answer to the user's question.",
        "key_findings": [
          "Bullet point 1 detailing the specific verified metrics or issues",
          "Bullet point 2..."
        ],
        "recommended_action": {
          "title": "Short title of action (e.g. Increase Renewable Energy)",
          "description": "Why and what impact it will have.",
          "button_label": "Text for the action button (e.g. OPEN WHAT-IF, VIEW BRSR GAP, GO TO DATA)",
          "button_route": "The route to navigate to (e.g. /dashboard/simulator, /dashboard/brsr, /dashboard/data, /dashboard/carbon-roi)"
        },
        "source": "Name of the source (e.g. Verified Dashboard Dataset, BRSR Intelligence, Policy Delta Radar)",
        "confidence": "VERIFIED (if using raw data) or CALCULATED (if using metrics) or INSUFFICIENT DATA (if missing)"
      }
      
      Note on recommended_action: If no action makes sense, you can leave the fields as null or empty strings.
    `;

    const fullPrompt = previousInteractionId ? prompt : `
      SYSTEM INSTRUCTIONS:
      ${systemInstruction}

      VERIFIED DATASET CONTEXT:
      ${JSON.stringify(context)}

      USER QUESTION:
      ${prompt}
    `;

    console.log('[Copilot] Model: gemini-3.6-flash');
    console.log('[Copilot] Endpoint: Interactions API');
    console.log('[Copilot] Calling Gemini...');
    
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });

    const interactionOptions = {
      model: "gemini-3.6-flash",
      input: fullPrompt
    };
    
    if (previousInteractionId) {
      interactionOptions.previousInteractionId = previousInteractionId;
    }

    const interaction = await ai.interactions.create(interactionOptions);
    const resultText = interaction.output_text;
    const newInteractionId = interaction.interactionId || interaction.id || null;

    if (!resultText) {
      console.log('[Copilot] Gemini response: ERROR');
      throw new Error("Invalid response format from Gemini");
    }

    console.log('[Copilot] Gemini response: SUCCESS');

    let parsedResults;
    try {
      // Strip potential markdown code blocks if the AI wraps JSON in ```json ... ```
      let cleanedText = resultText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      parsedResults = JSON.parse(cleanedText);
    } catch (e) {
      // If parsing fails, fall back to returning text
      parsedResults = { summary: resultText, key_findings: [], source: "Gemini" };
    }

    console.log('[Copilot] Returning response');
    return res.status(200).json({ success: true, response: parsedResults, interactionId: newInteractionId });
  } catch (error) {
    console.error("Gemini Copilot Error:", error);
    
    console.log('[Copilot] Gemini error');
    console.log(`[Copilot] Message: ${error.message}`);
    console.log('[Copilot] Model: gemini-3.6-flash');

    if (error.name === 'AbortError') {
      return res.status(504).json({ success: false, error: 'Copilot is temporarily unavailable (Timeout).' });
    }
    
    return res.status(500).json({ success: false, error: 'Gemini API request failed', details: error.message });
  }
}
