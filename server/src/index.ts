// server/src/index.ts
import express, { Express, Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import financialRecordRouter from "./routes/financial-records";
import aiRoutes from "./routes/ai";
import cors from "cors";
import * as dotenv from "dotenv";
dotenv.config();

const app: Express = express();
const port = Number(process.env.PORT || 3001);

// ----- Allowed origins (from env, fallback to sensible defaults) -----
const allowedOriginsEnv =
  process.env.ALLOWED_ORIGINS ||
  "http://localhost:5173,https://finance-tracker-theta-eight.vercel.app";
const allowedOrigins = allowedOriginsEnv
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

console.log("CORS Allowed origins:", allowedOrigins.join(", "));

// ----- CORS options (single source of truth) -----
const corsOptions: cors.CorsOptions = {
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
app.use(cors(corsOptions));

// ----- Middlewares -----
app.use(express.json());

// ----- Health check -----
app.get("/", (_req: Request, res: Response) => {
  res.send("✅ Finance Tracker Backend is live!");
});

// ----- Routes (mounted after CORS + JSON middleware) -----
app.use("/api/ai", aiRoutes);
app.use("/financial-records", financialRecordRouter);

// ----- Error handler (report CORS errors clearly) -----
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err?.message?.startsWith("CORS:")) {
    console.error("CORS error:", err.message);
    return res.status(403).json({ error: "CORS policy blocked this request" });
  }
  console.error("Unhandled server error:", err);
  return res.status(500).json({ error: "Internal server error" });
});

// ----- Connect to Mongo and start server -----
const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
  console.error(
    "❌ MONGODB_URI not set in env. Set server/.env or Render env vars."
  );
  process.exit(1);
}

mongoose
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