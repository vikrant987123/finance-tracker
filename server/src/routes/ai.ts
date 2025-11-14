// server/src/routes/ai.ts
import { Router } from "express";
import { categorizeTransaction } from "../controllers/aiController";

const router = Router();

// POST /api/ai/categorize
router.post("/categorize", categorizeTransaction);

export default router;
