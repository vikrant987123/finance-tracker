import express, { Express } from 'express';
import mongoose from 'mongoose';
import financialRecordRouter from './routes/financial-records';
import cors from "cors";

const app: Express = express();
const port = process.env.PORT || 3001;

// ✅ Allow CORS from frontend
app.use(cors({
  origin: "https://finance-tracker-theta-eight.vercel.app",
  credentials: true,
}));

app.use(express.json());

// ✅ Root route for testing
app.get("/", (req, res) => {
  res.send("✅ Finance Tracker Backend is live!");
});

// ✅ FIX 1: Added database name at the end → /financeDB
const mongoURI: string = "mongodb+srv://vermabackup213:i9NxWZMfntCkaYBI@personalfinancetracker.uhaogic.mongodb.net/financeDB";

// ✅ FIX 2: Connect to DB, THEN start server
mongoose.connect(mongoURI)
  .then(() => {
    console.log("✅ Connected to MongoDB");

    // ✅ Only start server after DB is ready
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB:", err);
  });

// ✅ Mount route
app.use("/financial-records", financialRecordRouter);
