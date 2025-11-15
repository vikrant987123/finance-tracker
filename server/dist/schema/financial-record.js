"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const financialRecordSchema = new mongoose_1.default.Schema({
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
}, { timestamps: true } // automatically adds createdAt and updatedAt
);
const FinancialRecordModel = mongoose_1.default.model("FinancialRecord", financialRecordSchema);
exports.default = FinancialRecordModel;
