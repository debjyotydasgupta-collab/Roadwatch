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

// POST /auth/authority — Handle authority login
router.post("/auth/authority", (req, res) => {
  const { passcode } = req.body;
  const validPasscode = process.env.AUTHORITY_PASSCODE || "ADMIN123";

  if (passcode === validPasscode) {
    console.log("✅ Authority successfully authenticated.");
    return res.status(200).json({
      user: {
        id: "auth-1",
        name: "Admin Officer",
        email: "admin@roadwatch.gov",
        role: "authority",
        points: 0,
      }
    });
  }

  console.log("❌ Failed authority authentication attempt.");
  return res.status(401).json({ error: "Invalid passcode" });
});

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
    const { data, error } = await supabase
      .from('Complaints')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Map photo_url to image_url to match expected flat format
    const formattedData = data.map(c => ({
      id: c.id,
      latitude: c.latitude,
      longitude: c.longitude,
      severity: c.severity,
      status: c.status,
      address: c.address,
      image_url: c.photo_url,
      created_at: c.created_at,
      issue_type: c.issue_type // Keep for other uses just in case
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// 4. PATCH /complaints/:id
router.patch('/complaints/:id', async (req, res) => {
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
    res.status(200).json(data);
  } catch (error) {
    console.error('Error updating complaint:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// 5. GET /spending/:pincode
router.get('/spending/:pincode', async (req, res) => {
  try {
    const { pincode } = req.params;
    console.log(`💰 Frontend searching spending for Pincode: ${pincode}...`);

    let dbProjects = null;
    try {
      const { data, error } = await supabase
        .from('Budgets')
        .select('*')
        .eq('pincode', pincode);
      if (!error && data && data.length > 0) {
        dbProjects = data;
      }
    } catch (dbErr) {
      console.log(`Supabase 'Budgets' table missing or error. Falling back to AI...`);
    }

    if (dbProjects) {
      console.log(`✅ Found ${dbProjects.length} actual projects in database.`);
      return res.json(dbProjects);
    }

    if (!ai) {
        throw new Error("Gemini AI client not configured. Please set GEMINI_API_KEY in .env");
    }

    // Generate mock data using Gemini API
    console.log(`🤖 AI Budget Fallback: Generating highly realistic infrastructure mock data for ${pincode}...`);
    const prompt = `Search the web for real infrastructure, road, or municipal projects in or near the Indian pincode ${pincode}. If you find real projects, return them. If you cannot find exact projects for this pincode, generate 2 highly realistic mock road infrastructure projects that could plausibly exist in that specific region based on your geographical knowledge. Reply with ONLY a raw JSON array of objects containing these exact keys: 'road_name', 'contractor_name' (or 'Government'), 'allocated_amount' (a realistic integer in INR), 'deadline' (a future date string), and 'status' (choose 'In Progress' or 'Tender Stage'). Do not include markdown formatting like \`\`\`json.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      tools: [{ googleSearch: {} }]
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
