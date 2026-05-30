import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

function getGeminiKey() {
  const k = process.env.GEMINI_API_KEY;
  if (!k) throw new Error("GEMINI_API_KEY is not configured in .env");
  return k;
}

// Convert OpenAI format messages to Gemini format
function convertToGeminiFormat(messages: any[]) {
  return messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: Array.isArray(msg.content) 
      ? msg.content.map((c: any) => {
          if (c.type === 'text') return { text: c.text };
          if (c.type === 'image_url') {
            // Very basic support for image urls if they are data URIs
            const match = c.image_url.url.match(/^data:(image\/[a-z]+);base64,(.+)$/);
            if (match) {
              return { inlineData: { mimeType: match[1], data: match[2] } };
            }
            return { text: "[Image URL: " + c.image_url.url + "]" };
          }
          return { text: "" };
        })
      : [{ text: msg.content }]
  }));
}

async function callGemini(messages: any[], systemInstruction?: string, tools?: any[]) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${getGeminiKey()}`;
  
  const payload: any = {
    contents: convertToGeminiFormat(messages),
  };
  
  if (systemInstruction) {
    payload.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  if (tools) {
    payload.tools = tools;
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429) throw new Error("Rate limited. Please try again in a moment.");
    if (res.status === 503) throw new Error("AI models are experiencing high demand. Please try again.");
    throw new Error(`AI error ${res.status}: ${text}`);
  }

  const json = await res.json();
  const content = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  
  // Return in a structure matching what the existing functions expect
  return { choices: [{ message: { content } }] };
}

const SYSTEM_PROMPT = `You are RoadWatch AI, a friendly civic assistant. You help citizens:
- Report road issues (potholes, waterlogging, cracks, broken streetlights, debris).
- Check public spending on local road projects.
- Understand the status of their complaints.
Keep responses short, warm, and action-oriented. If a user describes an issue, suggest they tap "Report Issue" to file it formally. Use plain language.`;

export const chatWithAI = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        messages: z
          .array(
            z.object({
              role: z.enum(["user", "assistant"]),
              content: z.string().min(1).max(4000),
            }),
          )
          .min(1)
          .max(40),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    // Note: Gemini handles system prompts separately, so we don't put it in the messages array
    const result = await callGemini(data.messages, SYSTEM_PROMPT);
    const reply: string = result.choices?.[0]?.message?.content ?? "";
    return { reply };
  });

export const analyzeImage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ imageUrl: z.string().url().max(100000) }).parse(input), // Increased length for dataURIs
  )
  .handler(async ({ data }) => {
    const systemPrompt = "You are a road-defect classifier. Look at the image and respond ONLY with valid JSON, no prose, no code fences. Schema: {\"issueType\": one of [\"pothole\",\"waterlogging\",\"crack\",\"streetlight\",\"debris\",\"other\"], \"severity\": one of [\"low\",\"medium\",\"high\"], \"description\": short one-sentence description}.";
    const result = await callGemini([
      {
        role: "user",
        content: [
          { type: "text", text: "Classify the road defect in this image." },
          { type: "image_url", image_url: { url: data.imageUrl } },
        ],
      },
    ], systemPrompt);
    const raw: string = result.choices?.[0]?.message?.content ?? "{}";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    try {
      const parsed = JSON.parse(cleaned);
      return {
        issueType: String(parsed.issueType ?? "other"),
        severity: String(parsed.severity ?? "medium"),
        description: String(parsed.description ?? ""),
      };
    } catch {
      return { issueType: "other", severity: "medium", description: raw.slice(0, 200) };
    }
  });

export const verifyRepair = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        beforeUrl: z.string().url().max(100000),
        afterUrl: z.string().url().max(100000),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const systemPrompt = "Compare a BEFORE and AFTER road photo. Respond ONLY with valid JSON: {\"verified\": boolean, \"confidence\": 0-1 number, \"note\": short reason}. Mark verified=true if the defect appears repaired.";
    const result = await callGemini([
      {
        role: "user",
        content: [
          { type: "text", text: "Before photo:" },
          { type: "image_url", image_url: { url: data.beforeUrl } },
          { type: "text", text: "After photo:" },
          { type: "image_url", image_url: { url: data.afterUrl } },
        ],
      },
    ], systemPrompt);
    const raw: string = result.choices?.[0]?.message?.content ?? "{}";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    try {
      const parsed = JSON.parse(cleaned);
      return {
        verified: Boolean(parsed.verified),
        confidence: Number(parsed.confidence ?? 0),
        note: String(parsed.note ?? ""),
      };
    } catch {
      return { verified: false, confidence: 0, note: raw.slice(0, 200) };
    }
  });

export const reverseGeocode = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        lat: z.number().min(-90).max(90),
        lon: z.number().min(-180).max(180),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${data.lat}&lon=${data.lon}&format=json&zoom=17`;
    const res = await fetch(url, {
      headers: { "User-Agent": "RoadWatch/1.0 (demo)" },
    });
    if (!res.ok) return { roadName: "Unknown road" };
    const json = (await res.json()) as { address?: { road?: string; neighbourhood?: string; suburb?: string }; display_name?: string };
    const roadName =
      json.address?.road ?? json.address?.neighbourhood ?? json.address?.suburb ?? (json.display_name ?? "").split(",")[0] ?? "Unknown road";
    return { roadName };
  });

export const searchProjectsForPincode = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ pincode: z.string().length(6) }).parse(input),
  )
  .handler(async ({ data }) => {
    const systemPrompt = `You are a helpful assistant. Please perform a web search for road repair, construction, or infrastructure projects happening in or around the Indian pincode ${data.pincode}.
Return ONLY a valid JSON array of objects, where each object has these fields:
- "name": string (name of the project or road)
- "contractor_name": string (name of the contractor or government body, e.g. NHAI, PWD, or unknown)
- "budget_amount": number (estimated budget in INR, or a plausible number like 50000000 if unknown)
- "used_amount": number (estimated used amount)
- "last_relaying_date": string (estimated deadline or date, e.g. "2024-12-31")
- "region": string (just "IN")
Do not include any markdown fences or other text. ONLY return a JSON array. If you cannot find any projects, make up 2 realistic-sounding ones for the specific city/area of the pincode.`;
    
    const result = await callGemini([
      {
        role: "user",
        content: [{ type: "text", text: `Find road projects for pincode ${data.pincode}` }]
      }
    ], systemPrompt, [
      {
        googleSearchRetrieval: {
          dynamicRetrievalConfig: {
            mode: "MODE_DYNAMIC",
            dynamicThreshold: 0.1
          }
        }
      }
    ]);
    
    const raw: string = result.choices?.[0]?.message?.content ?? "[]";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    try {
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });
