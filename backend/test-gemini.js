require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { GoogleGenAI } = require('@google/genai');

async function test() {
  console.log("Key:", process.env.GEMINI_API_KEY ? "EXISTS" : "MISSING");
  const ai = new GoogleGenAI({});
  try {
    console.log("Calling Gemini...");
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Generate 2 highly realistic mock road infrastructure projects for the Indian pincode 723102. Reply with ONLY a raw JSON array of objects containing these exact keys: 'road_name', 'contractor_name', 'allocated_amount' (a realistic integer in INR), 'deadline' (a future date string), and 'status' (choose 'In Progress' or 'Tender Stage'). Do not include markdown formatting like ```json.",
    });
    console.log("Response:", response.text);
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
