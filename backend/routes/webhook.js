const express = require('express');
const router = express.Router();
const TelegramBot = require('node-telegram-bot-api');
const supabase = require('../config/supabase');
const { GoogleGenAI } = require('@google/genai');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// 1. Initialize Telegram Bot
let bot;
if (TELEGRAM_BOT_TOKEN) {
  // Do not pass { webHook: true } as it starts an internal server. We use Express.
  bot = new TelegramBot(TELEGRAM_BOT_TOKEN);
} else {
  console.warn("TELEGRAM_BOT_TOKEN is missing. Telegram bot is not initialized.");
}

// Initialize Gemini Client
let ai;
try {
  ai = new GoogleGenAI({});
} catch (e) {
  console.warn("Gemini Client error. Ensure GEMINI_API_KEY is configured in .env", e.message);
}

// In-memory state for hackathon demo to link location with photo
const userStates = {};

// 2. Set up POST /telegram endpoint
// First, add a helper route to register the webhook URL with Telegram
router.get('/setup', async (req, res) => {
  try {
    if (!bot) return res.status(400).send("Bot not initialized");
    // req.get('host') will be the pinggy URL if accessed through pinggy
    const url = `https://${req.get('host')}/webhook/telegram`;
    await bot.setWebHook(url);
    console.log(`✅ Webhook registered to: ${url}`);
    res.send(`Webhook successfully set to ${url}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to set webhook");
  }
});

router.post('/telegram', async (req, res) => {
  try {
    const update = req.body;
    
    // Ignore if bot isn't set up or invalid payload
    if (!bot || !update || !update.message) {
      return res.status(200).send('OK');
    }

    const msg = update.message;
    const chatId = msg.chat.id;
    console.log(`\n📲 Incoming Telegram Report from Chat ID: ${chatId}...`);

    // 3. Handle text messages like /start
    if (msg.text) {
      if (msg.text.trim() === '/start') {
        await bot.sendMessage(chatId, "Welcome to RoadWatch. Please send a photo of the road issue along with your location pin to report it.");
      } else {
        await bot.sendMessage(chatId, "Please send a photo of the road issue along with your location pin to report it.");
      }
      return res.status(200).send('OK');
    }

    // 4. Handle Location messages
    if (msg.location) {
      userStates[chatId] = { lat: msg.location.latitude, lon: msg.location.longitude };
      await bot.sendMessage(chatId, "Location received! 📍 Now please send a photo of the road issue.");
      return res.status(200).send('OK');
    }

    // 5. Handle Photo messages
    if (msg.photo) {
      // Use saved location or a default Bangalore location with slight random offset
      const lat = userStates[chatId]?.lat || 12.9716 + (Math.random() - 0.5) * 0.05;
      const lon = userStates[chatId]?.lon || 77.5946 + (Math.random() - 0.5) * 0.05;

      // Get highest resolution photo (last in the array)
      const highestResPhoto = msg.photo[msg.photo.length - 1];
      const fileId = highestResPhoto.file_id;
      
      // Use Telegram API to get the actual image URL
      const imageUrl = await bot.getFileLink(fileId);

      // 5. Reverse Geocoding (No API Key needed) via Nominatim
      console.log(`📍 Geocoding Location via OpenStreetMap (${lat}, ${lon})...`);
      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
      const geoResponse = await fetch(nominatimUrl, {
        headers: {
          'User-Agent': 'RoadWatch-App/1.0 (Backend Node App)'
        }
      });
      const geoData = await geoResponse.json();
      const address = geoData.display_name || 'Unknown Address';

      // 6. AI Vision
      if (!ai) {
        throw new Error("Gemini AI client not initialized.");
      }

      // Fetch the image bytes to pass to Gemini
      console.log(`👁️ Gemini AI Analyzing Image...`);
      const imgRes = await fetch(imageUrl);
      const imgBuffer = await imgRes.arrayBuffer();
      const base64Image = Buffer.from(imgBuffer).toString('base64');
      const mimeType = imgRes.headers.get('content-type') || 'image/jpeg';

      const prompt = "Analyze this road image. Reply with ONLY a raw JSON object containing two keys: 'issue_type' (choose either pothole, waterlogging, or crack) and 'severity' (choose Critical, Moderate, or Minor). If no issue is found, still pick the closest match or guess.";

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          prompt,
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType
            }
          }
        ]
      });

      // Parse JSON from AI
      let aiText = aiResponse.text || '';
      aiText = aiText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const aiResult = JSON.parse(aiText);

      const issue_type = aiResult.issue_type || 'unknown';
      const severity = aiResult.severity || 'Minor';
      console.log(`🧠 AI Results -> Type: ${issue_type}, Severity: ${severity}`);

      // 7. Database Insertion
      console.log(`💾 Saving to Supabase...`);
      const { error: dbError } = await supabase
        .from('Complaints')
        .insert([{
          photo_url: imageUrl,
          latitude: lat,
          longitude: lon,
          address: address,
          issue_type: issue_type,
          severity: severity,
          status: 'Reported'
        }]);

      if (dbError) {
        throw dbError;
      }

      // 8. Final Reply
      const replyMessage = `Issue successfully logged! AI classified this as a ${severity} ${issue_type} at ${address}. It has been routed to the municipal dashboard.`;
      await bot.sendMessage(chatId, replyMessage);
      console.log(`✅ Pipeline Complete! Reply sent to user.`);

      return res.status(200).send('OK');
    }

    // Default fallback return
    return res.status(200).send('OK');

  } catch (error) {
    // 9. Robust try/catch error handling, return 200 OK to prevent retries
    console.error("Telegram webhook error:", error);
    res.status(200).send('Error logged');
  }
});

module.exports = router;
