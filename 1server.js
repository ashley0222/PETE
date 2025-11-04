import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

// Load PETE's system prompt (behavior)
const systemPrompt = fs.readFileSync(
  path.join(__dirname, "config", "system-prompt.txt"),
  "utf8"
);

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "messages must be an array" });
    }

    const fullMessages = [
      { role: "system", content: systemPrompt },
      ...messages
    ];

    const completion = await client.chat.completions.create({
      model: MODEL,
      temperature: 0.4,
      messages: fullMessages
    });

    const answer =
      completion.choices?.[0]?.message?.content?.trim() ||
      "Sorry, I couldn't generate a response.";

    res.json({ reply: answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Server error. Check your API key and logs.",
      details: err?.response?.data || err.message
    });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`PETE is running at http://localhost:${port}`);
});
Delete duplicate file
