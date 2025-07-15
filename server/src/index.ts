//passMongoDB: i9NxWZMfntCkaYBI
//userNameMongoDB: vermabackup213
//connection: mongodb+srv://vermabackup213:i9NxWZMfntCkaYBI@personalfinancetracker.uhaogic.mongodb.net/

import express, { Express } from 'express';
import mongoose from 'mongoose';
import financialRecordRouter from './routes/financial-records'
import cors from "cors";

const app: Express = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: "https://finance-tracker-theta-eight.vercel.app",
  credentials: true,
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("✅ Finance Tracker Backend is live!");
});


const mongoURI: string = "mongodb+srv://vermabackup213:i9NxWZMfntCkaYBI@personalfinancetracker.uhaogic.mongodb.net/";

mongoose
    .connect(mongoURI)
    .then(() => console.log("CONNNECTED TO MONGDB!"))
    .catch((err) => console.log("Failed to connect to mongoDB", err));

mongoose.connection.once("open", () => {
  console.log("📦 Connected to DB:", mongoose.connection.db?.databaseName);
});    

app.use("/financial-records", financialRecordRouter);

app.listen(port, () => {
    console.log(`Server Running on Port ${port}`);
});