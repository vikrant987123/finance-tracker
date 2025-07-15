import express, { Request, Response, Router } from "express";
import FinancialRecordModel from "../schema/financial-record";
import cloudinary from "../utils/cloudinary";


const router = Router();

// GET all records for a user
router.get("/getAllbyUserID/:userId", async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId;
        const records = await FinancialRecordModel.find({ userId });

        if (records.length === 0) {
            return res.status(404).send("No records found for the user");
        }

        res.status(200).send(records);
    } catch (err) {
        res.status(500).send(err);
    }
});

// POST a new record
router.post("/", async (req: Request, res: Response) => {
  try {
    const { userId, date, description, amount, category, paymentMethod, receiptImage } = req.body;

    let uploadedImageUrl = "";

    if (receiptImage) {
      const uploadResponse = await cloudinary.uploader.upload(receiptImage, {
        folder: "receipts",
      });
      uploadedImageUrl = uploadResponse.secure_url;
    }

    const newRecord = new FinancialRecordModel({
      userId,
      date: new Date(date), // Ensure date is parsed
      description,
      amount,
      category,
      paymentMethod,
      receiptUrl: uploadedImageUrl, // Optional receipt field
    });

    const savedRecord = await newRecord.save();
    res.status(201).send(savedRecord);
  } catch (err: any) {
        console.error("❌ POST /financial-records error:", err.message || err);
        res.status(500).json({
            error: "Server error",
            details: err.message || err,
        });
    }   
});



// PUT to update a record by ID
router.put("/:id", async (req: Request, res: Response) => {
    try {
        const updated = await FinancialRecordModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.status(200).send(updated);
    } catch (err) {
        res.status(500).send(err);
    }
});

// DELETE a record by ID
router.delete("/:id", async (req: Request, res: Response) => {
    try {
        const deleted = await FinancialRecordModel.findByIdAndDelete(req.params.id);
        res.status(200).send(deleted);
    } catch (err) {
        res.status(500).send(err);
    }
});

export default router;
