"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.categorizeTransaction = categorizeTransaction;
const dotenv = __importStar(require("dotenv"));
dotenv.config();
// ✅ FIXED: Correct package and class name
const generative_ai_1 = require("@google/generative-ai");
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.warn("GEMINI_API_KEY not set — AI endpoints will fail until configured.");
}
// ✅ FIXED: Correct class instantiation
const ai = new generative_ai_1.GoogleGenerativeAI(apiKey || "");
function categorizeTransaction(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        try {
            const body = req.body;
            const { ocrText = "", ocrItems, suggestedAmount, merchant, filename, date, paymentMethod, total, } = body;
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
merchant: "${String(merchant !== null && merchant !== void 0 ? merchant : "unknown").replace(/"/g, "'")}"
filename: "${String(filename !== null && filename !== void 0 ? filename : "unknown").replace(/"/g, "'")}"
date: "${String(date !== null && date !== void 0 ? date : "").replace(/"/g, "'")}"
paymentMethod: "${String(paymentMethod !== null && paymentMethod !== void 0 ? paymentMethod : "unknown").replace(/"/g, "'")}"
suggestedAmount: ${suggestedAmount !== null && suggestedAmount !== void 0 ? suggestedAmount : (total !== null && total !== void 0 ? total : null)}
total: ${total !== null && total !== void 0 ? total : null}

END OF PROMPT
`.trim();
            const model = (_a = process.env.GEMINI_MODEL) !== null && _a !== void 0 ? _a : "gemini-2.0-flash-exp";
            // TEST MODE: don't call provider; return conservative mock
            if (process.env.AI_TEST_MODE === "1") {
                const mockItems = Array.isArray(ocrItems) && ocrItems.length
                    ? ocrItems
                    : [{ name: String(ocrText).slice(0, 80), amount: (_b = total !== null && total !== void 0 ? total : suggestedAmount) !== null && _b !== void 0 ? _b : null }];
                const mockDescription = Array.isArray(ocrItems) && ocrItems.length
                    ? `${mockItems.length} items from ${merchant !== null && merchant !== void 0 ? merchant : "merchant"}`.slice(0, 120)
                    : (ocrText ? String(ocrText).slice(0, 80) : "Receipt");
                const mock = {
                    description: mockDescription,
                    category: "Dining",
                    subcategory: "Main",
                    normalized_amount: (_c = total !== null && total !== void 0 ? total : suggestedAmount) !== null && _c !== void 0 ? _c : null,
                    confidence: 0.85,
                    tags: ["mock"],
                    notes: "mock response",
                };
                return res.json({ ok: true, ai: mock, raw: { mock: true } });
            }
            // ✅ FIXED: Correct API call using GoogleGenerativeAI SDK
            const generativeModel = ai.getGenerativeModel({ model });
            const result = yield generativeModel.generateContent(prompt);
            const response = yield result.response;
            const rawText = response.text();
            // Attempt to parse JSON directly
            let aiJson = null;
            try {
                aiJson = JSON.parse(rawText.trim());
            }
            catch (err) {
                // try to extract first {...} object substring
                const match = rawText.match(/\{[\s\S]*\}/);
                if (match) {
                    try {
                        aiJson = JSON.parse(match[0]);
                    }
                    catch (err2) {
                        // failed to parse JSON substring
                        return res.status(502).json({ error: "AI returned invalid JSON", raw: rawText });
                    }
                }
                else {
                    return res.status(502).json({ error: "AI returned no JSON", raw: rawText });
                }
            }
            // Normalize and ensure description exists (fallback to brief derived summary)
            const fallbackDescription = (() => {
                if ((aiJson === null || aiJson === void 0 ? void 0 : aiJson.description) && typeof aiJson.description === "string" && aiJson.description.trim().length > 0) {
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
            const normalized_amount = typeof aiJson.normalized_amount === "number"
                ? aiJson.normalized_amount
                : ((_d = total !== null && total !== void 0 ? total : suggestedAmount) !== null && _d !== void 0 ? _d : null);
            const confidence = typeof aiJson.confidence === "number"
                ? Math.max(0, Math.min(1, Number(aiJson.confidence)))
                : 0.5;
            const tags = Array.isArray(aiJson.tags) ? aiJson.tags.map((t) => String(t)) : [];
            const final = {
                description: String((_e = aiJson.description) !== null && _e !== void 0 ? _e : fallbackDescription),
                category: (_f = aiJson.category) !== null && _f !== void 0 ? _f : "Other",
                subcategory: (_g = aiJson.subcategory) !== null && _g !== void 0 ? _g : null,
                normalized_amount: normalized_amount === undefined ? null : normalized_amount,
                confidence,
                tags,
                notes: typeof aiJson.notes === "string" ? aiJson.notes : "",
            };
            return res.json({ ok: true, ai: final, raw: rawText });
        }
        catch (error) {
            console.error("AI categorize error:", error);
            return res.status(500).json({ error: "AI categorize failed", details: (_h = error.message) !== null && _h !== void 0 ? _h : error });
        }
    });
}
