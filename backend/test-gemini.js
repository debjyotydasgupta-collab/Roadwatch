require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { GoogleGenAI } = require('@google/genai');

async function test() {
  console.log("Key:", process.env.GEMINI_API_KEY ? "EXISTS" : "MISSING");
  const ai = new GoogleGenAI({});
  try {
    console.log("Calling Gemini...");
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Search the web for real infrastructure or road projects in or near the Indian pincode 723102. Reply with ONLY a raw JSON array of objects containing: 'road_name', 'contractor_name' (or 'Government'), 'allocated_amount' (integer INR), 'deadline', and 'status'. Do not include markdown.",
      tools: [{ googleSearch: {} }]
    });
    console.log("Response:", response.text);
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
