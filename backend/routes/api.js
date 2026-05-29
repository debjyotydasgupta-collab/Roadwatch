const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { GoogleGenAI } = require('@google/genai');

// Initialize Gemini Client
// The GoogleGenAI client automatically uses process.env.GEMINI_API_KEY
let ai;
try {
  ai = new GoogleGenAI({});
} catch (e) {
  console.warn("Could not initialize Gemini Client automatically. Ensure GEMINI_API_KEY is in your .env", e.message);
}

// POST /complaints — web app report submission
router.post("/complaints", async (req, res) => {
  try {
    const {
      issue_type,
      severity,
      latitude,
      longitude,
      address,
      photo_url,
      status = "Reported",
    } = req.body;

    if (!issue_type || !latitude || !longitude) {
      return res.status(400).json({ error: "issue_type, latitude, and longitude are required" });
    }

    const row = {
      issue_type,
      severity: severity || "Moderate",
      latitude,
      longitude,
      address: address || "Unknown",
      photo_url: photo_url || null,
      status,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from("Complaints").insert([row]).select().single();
    if (error) throw error;
    console.log(`✅ New complaint filed via web: ${data.id}`);
    res.status(201).json(data);
  } catch (error) {
    console.error("Error creating complaint:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

// GET /complaints
router.get('/complaints', async (req, res) => {
  try {
    console.log(`🗺️ Frontend requested map data (GET /complaints)...`);
    console.log("🟢 Frontend requested complaints data!");
    const { data, error } = await supabase
      .from('Complaints')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// 4. PATCH /complaints/:id/status
router.patch('/complaints/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    console.log(`🔄 Dashboard updating complaint ${id} to status: ${status}...`);

    const { data, error } = await supabase
      .from('Complaints')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating complaint status:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// 5. GET /spending/:pincode
router.get('/spending/:pincode', async (req, res) => {
  try {
    const { pincode } = req.params;
    console.log(`💰 Frontend searching spending for Pincode: ${pincode}...`);

    // Query Supabase Budgets table
    const { data, error } = await supabase
      .from('Budgets')
      .select('*')
      .eq('pincode', pincode);

    if (error) throw error;

    if (data && data.length > 0) {
      console.log(`✅ Found ${data.length} actual projects in database.`);
      return res.json(data);
    }

    if (!ai) {
        throw new Error("Gemini AI client not configured. Please set GEMINI_API_KEY in .env");
    }

    // Generate mock data using Gemini API
    console.log(`🤖 AI Budget Fallback: Generating highly realistic infrastructure mock data for ${pincode}...`);
    const prompt = `Generate 2 highly realistic mock road infrastructure projects for the Indian pincode ${pincode}. Return ONLY a raw JSON array of objects containing exact keys: "road_name", "contractor_name", "allocated_amount" (realistic integer in INR), "deadline" (future date string), and "status" (In Progress, or Tender Stage). Do not include markdown formatting or any other text.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    let responseText = response.text || '';
    // Clean up markdown formatting if Gemini includes it
    responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();

    const mockProjects = JSON.parse(responseText);
    res.json(mockProjects);
  } catch (error) {
    console.error('Error fetching/generating spending data:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

module.exports = router;
