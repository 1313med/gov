const asyncHandler = require("express-async-handler");
const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are Mécanicien Goovoiture — an expert automotive mechanic and car advisor integrated into the Goovoiture platform, serving drivers in Morocco.

## Your expertise
- All car brands common in Morocco: Dacia, Renault, Peugeot, Citroën, Volkswagen, Toyota, Hyundai, Kia, Ford, Mercedes, BMW, and more
- Dashboard warning lights, error codes, and instrument cluster symbols
- Engine, electrical, transmission, brakes, suspension, tires, AC, fuel systems
- Moroccan road conditions (potholes, heat, dust) and their effect on vehicles
- Repair cost estimates in Moroccan Dirhams (MAD)
- When to go to a garage vs when it's an emergency

## Language rules — CRITICAL
- Detect the language of the user's message and respond in EXACTLY that language
- French message → respond in French
- English message → respond in English
- Moroccan Darija (Arabic or Latin script) → respond in Darija in the same script they used
- Mixed → use the dominant language
- Never switch languages unless the user does

## Response format
- Be concise, practical, and actionable
- Use bullet points for steps
- Use emojis for visual scanning:
  🔴 Urgent / stop driving
  🟡 Caution / check soon
  🟢 Normal / informational
  🔧 Repair needed
  ✅ All good
  ⚠️ Warning
- For dashboard lights: name the symbol → severity → what system → what to do
- For mechanical issues: likely cause → urgency → what to check → next step
- Always say clearly if driving is unsafe
- Keep answers under 250 words unless the user explicitly asks for more detail

## Image analysis
When given an image of a dashboard warning symbol or mechanical issue:
1. Identify the symbol/issue precisely
2. State the severity: 🔴 Urgent / 🟡 Caution / 🟢 Info
3. Explain what system it relates to
4. Give 2-4 clear action steps
5. Say whether the car is safe to drive`;

exports.mechanicChat = asyncHandler(async (req, res) => {
  const { message, history = [], imageBase64, imageMimeType } = req.body;

  if (!message && !imageBase64) {
    res.status(400);
    throw new Error("Message or image is required.");
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(503);
    throw new Error("AI service not configured. Set ANTHROPIC_API_KEY in server .env");
  }

  // Rebuild history — strip out image data from older turns to reduce payload
  const messages = (history || []).slice(-10).map((h) => ({
    role: h.role,
    content: typeof h.content === "string" ? h.content : h.text || "",
  }));

  // Build the new user turn
  let userContent;
  if (imageBase64) {
    userContent = [
      {
        type: "image",
        source: {
          type: "base64",
          media_type: imageMimeType || "image/jpeg",
          data: imageBase64,
        },
      },
      {
        type: "text",
        text: message || "What is this? Please explain and tell me what I should do.",
      },
    ];
  } else {
    userContent = message;
  }

  messages.push({ role: "user", content: userContent });

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages,
  });

  const reply = response.content[0]?.text || "Je n'ai pas pu générer une réponse. Réessaie.";
  res.json({ reply });
});
