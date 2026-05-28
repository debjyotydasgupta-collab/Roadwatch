import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";

function key() {
  const k = process.env.LOVABLE_API_KEY;
  if (!k) throw new Error("LOVABLE_API_KEY is not configured");
  return k;
}

async function callAI(body: Record<string, unknown>) {
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${key()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, ...body }),
  });
  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429) throw new Error("Rate limited. Please try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Please top up your workspace.");
    throw new Error(`AI gateway error ${res.status}: ${text}`);
  }
  return res.json();
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
    const result = await callAI({
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...data.messages],
    });
    const reply: string = result.choices?.[0]?.message?.content ?? "";
    return { reply };
  });

export const analyzeImage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ imageUrl: z.string().url().max(2000) }).parse(input),
  )
  .handler(async ({ data }) => {
    const result = await callAI({
      messages: [
        {
          role: "system",
          content:
            "You are a road-defect classifier. Look at the image and respond ONLY with valid JSON, no prose, no code fences. Schema: {\"issueType\": one of [\"pothole\",\"waterlogging\",\"crack\",\"streetlight\",\"debris\",\"other\"], \"severity\": one of [\"low\",\"medium\",\"high\"], \"description\": short one-sentence description}.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Classify the road defect in this image." },
            { type: "image_url", image_url: { url: data.imageUrl } },
          ],
        },
      ],
    });
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
        beforeUrl: z.string().url().max(2000),
        afterUrl: z.string().url().max(2000),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const result = await callAI({
      messages: [
        {
          role: "system",
          content:
            "Compare a BEFORE and AFTER road photo. Respond ONLY with valid JSON: {\"verified\": boolean, \"confidence\": 0-1 number, \"note\": short reason}. Mark verified=true if the defect appears repaired.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Before photo:" },
            { type: "image_url", image_url: { url: data.beforeUrl } },
            { type: "text", text: "After photo:" },
            { type: "image_url", image_url: { url: data.afterUrl } },
          ],
        },
      ],
    });
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
