// server/src/controllers/aiController.ts
import { Request, Response } from "express";
import * as dotenv from "dotenv";
dotenv.config();

// ✅ FIXED: Correct package and class name
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("GEMINI_API_KEY not set — AI endpoints will fail until configured.");
}

// ✅ FIXED: Correct class instantiation
const ai = new GoogleGenerativeAI(apiKey || "");

type AiRequestBody = {
  ocrText?: string;
  ocrItems?: { name: string; amount?: number | null }[];
  suggestedAmount?: number | null;
  merchant?: string | null;
  filename?: string | null;
  date?: string | null;
  paymentMethod?: string | null;
  total?: number | null;
};

export async function categorizeTransaction(req: Request, res: Response) {
  try {
    const body = req.body as AiRequestBody;
    const {
      ocrText = "",
      ocrItems,
      suggestedAmount,
      merchant,
      filename,
      date,
      paymentMethod,
      total,
    } = body;

    if (!ocrText && !(Array.isArray(ocrItems) && ocrItems.length > 0)) {
      return res.status(400).json({ error: "ocrText or ocrItems is required" });
    }

    // Strict schema: added "description" (one-line summary) as requested.
    const prompt = `
You are a precise transaction-categorization assistant.
Input may include item-level data (ocrItems) or plain OCR text (ocrText).
Return ONLY a single JSON object (no explanation, no markdown) that exactly matches this schema:

{
  "description": "<short one-line summary of the receipt suitable for a form description>",
  "category": "<one-word category: Groceries, Transport, Utilities, Dining, Shopping, Healthcare, Rent, Bills, Entertainment, Income, Other>",
  "subcategory": "<optional short subcategory or null>",
  "normalized_amount": <number|null>,
  "confidence": <number between 0.0 and 1.0>,
  "tags": ["short","lowercase","tags"],
  "notes": "<short reasoning up to 40 chars>"
}

Rules:
- description must be 6-12 words summarizing merchant/items/date (concise, human readable).
- If ocrItems present, use them to determine transaction-level category; if restaurant/food items present, choose Dining.
- If numeric total is reliable, set normalized_amount. If unsure, set null.
- confidence between 0.0 and 1.0; lower confidence when text is unclear.
- tags must be lowercase single words.
- notes must be <= 40 characters (brief reasoning or "amount_mismatch" if sums differ).
- Output must be valid JSON parseable by JSON.parse.

Input:
ocrItems: ${Array.isArray(ocrItems) && ocrItems.length ? JSON.stringify(ocrItems) : "[]"}
ocrText: "${String(ocrText || "").replace(/\n+/g, " ").replace(/"/g, "'")}"
merchant: "${String(merchant ?? "unknown").replace(/"/g, "'")}"
filename: "${String(filename ?? "unknown").replace(/"/g, "'")}"
date: "${String(date ?? "").replace(/"/g, "'")}"
paymentMethod: "${String(paymentMethod ?? "unknown").replace(/"/g, "'")}"
suggestedAmount: ${suggestedAmount ?? (total ?? null)}
total: ${total ?? null}

END OF PROMPT
`.trim();

    const model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash-exp";

    // TEST MODE: don't call provider; return conservative mock
    if (process.env.AI_TEST_MODE === "1") {
      const mockItems =
        Array.isArray(ocrItems) && ocrItems.length
          ? ocrItems
          : [{ name: String(ocrText).slice(0, 80), amount: total ?? suggestedAmount ?? null }];

      const mockDescription = Array.isArray(ocrItems) && ocrItems.length
        ? `${mockItems.length} items from ${merchant ?? "merchant"}`.slice(0, 120)
        : (ocrText ? String(ocrText).slice(0, 80) : "Receipt");

      const mock = {
        description: mockDescription,
        category: "Dining",
        subcategory: "Main",
        normalized_amount: total ?? suggestedAmount ?? null,
        confidence: 0.85,
        tags: ["mock"],
        notes: "mock response",
      };
      return res.json({ ok: true, ai: mock, raw: { mock: true } });
    }

    // ✅ FIXED: Correct API call using GoogleGenerativeAI SDK
    const generativeModel = ai.getGenerativeModel({ model });
    const result = await generativeModel.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();

    // Attempt to parse JSON directly
    let aiJson: any = null;
    try {
      aiJson = JSON.parse(rawText.trim());
    } catch (err) {
      // try to extract first {...} object substring
      const match = (rawText as string).match(/\{[\s\S]*\}/);
      if (match) {
        try {
          aiJson = JSON.parse(match[0]);
        } catch (err2) {
          // failed to parse JSON substring
          return res.status(502).json({ error: "AI returned invalid JSON", raw: rawText });
        }
      } else {
        return res.status(502).json({ error: "AI returned no JSON", raw: rawText });
      }
    }

    // Normalize and ensure description exists (fallback to brief derived summary)
    const fallbackDescription = (() => {
      if (aiJson?.description && typeof aiJson.description === "string" && aiJson.description.trim().length > 0) {
        return aiJson.description;
      }
      // build a short summary from ocrItems if present
      if (Array.isArray(ocrItems) && ocrItems.length) {
        const firstItems = ocrItems.slice(0, 3).map((it) => it.name).join(", ");
        const merchantPart = merchant ? `${merchant} - ` : "";
        return `${merchantPart}${firstItems}`.slice(0, 120);
      }
      // fallback to first 80 chars of ocrText
      return String(ocrText || "").replace(/\s+/g, " ").slice(0, 120) || "Receipt";
    })();

    // Normalize other fields defensively
    const normalized_amount =
      typeof aiJson.normalized_amount === "number"
        ? aiJson.normalized_amount
        : (total ?? suggestedAmount ?? null);

    const confidence =
      typeof aiJson.confidence === "number"
        ? Math.max(0, Math.min(1, Number(aiJson.confidence)))
        : 0.5;

    const tags = Array.isArray(aiJson.tags) ? aiJson.tags.map((t: any) => String(t)) : [];

    const final = {
      description: String(aiJson.description ?? fallbackDescription),
      category: aiJson.category ?? "Other",
      subcategory: aiJson.subcategory ?? null,
      normalized_amount: normalized_amount === undefined ? null : normalized_amount,
      confidence,
      tags,
      notes: typeof aiJson.notes === "string" ? aiJson.notes : "",
    };

    return res.json({ ok: true, ai: final, raw: rawText });
  } catch (error: any) {
    console.error("AI categorize error:", error);
    return res.status(500).json({ error: "AI categorize failed", details: error.message ?? error });
  }
}