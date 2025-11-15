"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/routes/ai.ts
const express_1 = require("express");
const aiController_1 = require("../controllers/aiController");
const router = (0, express_1.Router)();
// POST /api/ai/categorize
router.post("/categorize", aiController_1.categorizeTransaction);
exports.default = router;
