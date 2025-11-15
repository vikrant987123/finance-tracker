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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/index.ts
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const financial_records_1 = __importDefault(require("./routes/financial-records"));
const ai_1 = __importDefault(require("./routes/ai"));
const cors_1 = __importDefault(require("cors"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const app = (0, express_1.default)();
const port = Number(process.env.PORT || 3001);
// ----- Allowed origins (from env, fallback to sensible defaults) -----
const allowedOriginsEnv = process.env.ALLOWED_ORIGINS ||
    "http://localhost:5173,https://finance-tracker-theta-eight.vercel.app";
const allowedOrigins = allowedOriginsEnv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
console.log("CORS Allowed origins:", allowedOrigins.join(", "));
// ----- CORS options (single source of truth) -----
const corsOptions = {
    origin: (origin, callback) => {
        // Allow server-to-server requests (no origin) - like Postman, mobile apps
        if (!origin) {
            console.log("CORS: Allowing request with no origin (server-to-server)");
            return callback(null, true);
        }
        // Check if origin is in allowed list
        if (allowedOrigins.includes(origin)) {
            console.log(`CORS: ✅ Allowing origin -> ${origin}`);
            return callback(null, true);
        }
        // Reject disallowed origins
        console.warn(`CORS: ❌ Rejected origin -> ${origin}`);
        return callback(new Error(`CORS: origin ${origin} not allowed`), false);
    },
    credentials: true, // Required for cookies/auth headers
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "userid"], // Added 'userid' since you use it
    optionsSuccessStatus: 200,
};
// ----- Apply CORS middleware ONCE (this is all you need!) -----
app.use((0, cors_1.default)(corsOptions));
// ----- Middlewares -----
app.use(express_1.default.json());
// ----- Health check -----
app.get("/", (_req, res) => {
    res.send("✅ Finance Tracker Backend is live!");
});
// ----- Routes (mounted after CORS + JSON middleware) -----
app.use("/api/ai", ai_1.default);
app.use("/financial-records", financial_records_1.default);
// ----- Error handler (report CORS errors clearly) -----
app.use((err, _req, res, _next) => {
    var _a;
    if ((_a = err === null || err === void 0 ? void 0 : err.message) === null || _a === void 0 ? void 0 : _a.startsWith("CORS:")) {
        console.error("CORS error:", err.message);
        return res.status(403).json({ error: "CORS policy blocked this request" });
    }
    console.error("Unhandled server error:", err);
    return res.status(500).json({ error: "Internal server error" });
});
// ----- Connect to Mongo and start server -----
const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
    console.error("❌ MONGODB_URI not set in env. Set server/.env or Render env vars.");
    process.exit(1);
}
mongoose_1.default
    .connect(mongoURI)
    .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(port, () => {
        console.log(`🚀 Server running on port ${port}`);
        console.log(`📍 Allowed origins: ${allowedOrigins.join(", ")}`);
    });
})
    .catch((err) => {
    console.error("❌ Failed to connect to MongoDB:", err);
    process.exit(1);
});
