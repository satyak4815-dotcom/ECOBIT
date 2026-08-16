import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { companyData } = req.body;

  if (!companyData) {
    return res.status(400).json({ success: false, error: 'Missing company ESG profile' });
  }

  // GEMINI API KEY FROM SERVER ENVIRONMENT
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(503).json({ success: false, error: 'Gemini API key not configured on backend.' });
  }

  try {
    const prompt = `
      You are ECOBIT Policy Intelligence. Analyze the following verified company ESG metrics:
      ${JSON.stringify(companyData)}

      Search for current official ESG regulations.
      
      SOURCE PRIORITY:
      1. SEBI (e.g. https://www.sebi.gov.in/legal/circulars/jul-2023/brsr-core-framework-for-assurance-and-esg-disclosures-for-value-chain_73854.html)
      2. Ministry of Corporate Affairs (MCA) / Government of India
      3. Ministry of Environment, Forest and Climate Change (MoEFCC) (e.g. https://moef.gov.in/index.php/rules-regulations-3)
      4. Central Electricity Authority (CEA)
      
      Never use blogs, marketing websites, random articles, or unofficial summaries.
      If an official source cannot verify a requirement, mark status as "INSUFFICIENT DATA" instead of guessing.

      Identify relevant requirements, compare them to the metrics, and output a JSON array of objects with this EXACT structure:
      {
        "policy_name": "",
        "authority": "",
        "jurisdiction": "",
        "effective_date": "",
        "requirement": "",
        "affected_metric": "",
        "company_value": numeric_or_null,
        "required_value": numeric_or_null,
        "status": "COMPLIANT" | "POLICY GAP" | "INSUFFICIENT DATA",
        "risk": "LOW" | "HIGH" | "MEDIUM",
        "gap": "string explanation",
        "reason": "Why this matters",
        "recommended_action": "How to fix (step by step)",
        "source_url": "valid url",
        "source_section": "string"
      }

      Do NOT hallucinate requirements. If data is missing, mark as INSUFFICIENT DATA.
      Ensure the output is ONLY valid JSON.
    `;

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });

    const interaction = await ai.interactions.create({
      model: "gemini-3.6-flash",
      input: prompt
    });

    const resultText = interaction.output_text;
    
    if (!resultText) {
      throw new Error("Invalid response format from Gemini");
    }

    let parsedResults;
    try {
      let cleanedText = resultText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      parsedResults = JSON.parse(cleanedText);
    } catch (e) {
      throw new Error("Gemini returned invalid JSON");
    }

    return res.status(200).json({ success: true, findings: parsedResults });
  } catch (error) {
    console.error("Gemini Policy Scan Error:", error);
    
    if (error.name === 'AbortError') {
      return res.status(504).json({ success: false, error: 'Policy scan temporarily unavailable (Timeout).' });
    }
    
    return res.status(500).json({ success: false, error: 'Policy scan temporarily unavailable.' });
  }
}
