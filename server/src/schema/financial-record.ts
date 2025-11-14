import mongoose from "mongoose";

interface FinancialRecord {
  userId: string;
  date: Date;
  description: string;
  amount: number;
  category: string;
  paymentMethod: string;
  receiptUrl?: string;

  // --- AI-enhanced fields ---
  aiCategory?: string;        // AI-suggested main category
  aiSubcategory?: string;     // more specific category suggestion
  aiConfidence?: number;      // AI confidence score (0–1)
  aiTags?: string[];          // keywords/tags derived from AI
  aiNotes?: string;           // short reasoning or notes from Gemini
  ocrRaw?: string;            // optional: store raw OCR text
}

const financialRecordSchema = new mongoose.Schema<FinancialRecord>(
  {
    userId: { type: String, required: true },
    date: { type: Date, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    paymentMethod: { type: String, required: true },
    receiptUrl: { type: String, required: false },

    // --- AI-enhanced fields ---
    aiCategory: { type: String, required: false },
    aiSubcategory: { type: String, required: false },
    aiConfidence: { type: Number, required: false },
    aiTags: { type: [String], required: false },
    aiNotes: { type: String, required: false },
    ocrRaw: { type: String, required: false },
  },
  { timestamps: true } // automatically adds createdAt and updatedAt
);

const FinancialRecordModel = mongoose.model<FinancialRecord>(
  "FinancialRecord",
  financialRecordSchema
);

export default FinancialRecordModel;
