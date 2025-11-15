// client/src/pages/dashboard/financial-record-form.tsx
import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useFinancialRecords } from "../../contexts/financial-record-context";
import { BillUpload } from "../../components/BillUpload";
import { extractTextFromReceipt } from "../../utils/receipt-ocr";
import { categorizeExpense } from "../../utils/ai"; // fallback / existing wrapper
import toast from "react-hot-toast";

export const FinancialRecordForm = () => {
  const [description, setDescription] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false); // <- now controllable

  const { addRecord, categorizeReceipt } = useFinancialRecords();
  const { user } = useUser();

  const handleReceiptUpload = async (url: string) => {
    console.log("📄 Receipt uploaded, now calling OCR with URL:", url);
    setReceiptUrl(url);

    setUploading(true);
    try {
      const result = await extractTextFromReceipt(url); // 🧠 OCR logic
      console.log("🔍 OCR Result:", result);

      // If OCR returned a description/amount/paymentMethod, prefill them
      if (result.description) {
        setDescription(result.description);
        console.log("📝 Description set to:", result.description);
      }

      if (result.amount !== null && result.amount !== undefined) {
        setAmount(result.amount.toString());
      }

      if (result.paymentMethod) {
        setPaymentMethod(result.paymentMethod);
        console.log("💳 Payment method set to:", result.paymentMethod);
      }

      // === AI categorization: prefer using the context helper (categorizeReceipt).
      // If that is not available for some reason, fallback to your existing categorizeExpense util.
      try {
        const textForAi = result.description ?? "";

        if (textForAi.trim().length > 0) {
          // show lightweight UI feedback
          toast.loading("Categorizing transaction with AI...", { id: "ai-categorize" });

          // Prefer context helper (calls backend /api/ai/categorize)
          let aiResp: any = null;
          try {
            if (typeof categorizeReceipt === "function") {
              aiResp = await categorizeReceipt(textForAi, {
                description: result.description,
                amount: result.amount ?? undefined,
              });
            } else {
              // fallback to existing local util if context helper is missing
              const fallbackCategory = await categorizeExpense(textForAi);
              aiResp = { ok: true, ai: { category: fallbackCategory } };
            }
          } catch (err) {
            console.error("AI helper error:", err);
            aiResp = null;
          }

          toast.dismiss("ai-categorize");

          if (aiResp?.ok && aiResp.ai) {
            const ai = aiResp.ai;
            console.log("🤖 AI suggested:", ai);

            // Set category if AI provided one
            if (ai.category) {
              setCategory(ai.category);
              toast.success(`AI suggested: ${ai.category}`, { duration: 2000 });
            }

            // If AI normalized amount, prefer it (optional)
            if (ai.normalized_amount !== undefined && ai.normalized_amount !== null) {
              setAmount(String(ai.normalized_amount));
            }

            // You could also set subcategory / tags here if UI has fields for them
          } else {
            console.warn("AI categorize returned no suggestion:", aiResp);
          }
        } else {
          console.log("⚠️ No OCR text available for AI categorization");
        }
      } catch (aiErr) {
        toast.dismiss("ai-categorize");
        console.error("❌ AI categorization failed:", aiErr);
      }
    } catch (err) {
      console.error("❌ OCR failed:", err);
      toast.error("OCR failed. Check console for details.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Prevent submitting while OCR/AI is processing
    if (uploading) {
      alert("Please wait until receipt processing finishes.");
      return;
    }

    const newRecord = {
      userId: user?.id ?? "",
      date: new Date(),
      description,
      amount: parseFloat(amount || "0"),
      category,
      paymentMethod,
      receiptUrl: receiptUrl ?? undefined,
    };

    console.log("📤 Final record sent to backend:", newRecord);
    try {
      await addRecord(newRecord);
      alert("✅ Record added!");
    } catch (err) {
      console.error("Error adding record:", err);
      alert("❌ Failed to add record. See console for details.");
    }

    // Reset fields
    setDescription("");
    setAmount("");
    setCategory("");
    setPaymentMethod("");
    setReceiptUrl(null);
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="record-form">
        <div className="form-columns">
          {/* Left Form Section */}
          <div className="left-form">
            <div className="form-field">
              <label>Description:</label>
              <input
                type="text"
                required
                className="input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>Amount:</label>
              <input
                type="number"
                required
                className="input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>Category:</label>
              <select
                required
                className="input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select a Category</option>
                <option value="Food">Food</option>
                <option value="Rent">Rent</option>
                <option value="Salary">Salary</option>
                <option value="Utilities">Utilities</option>
                <option value="Shopping">Shopping</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-field">
              <label>Payment Method:</label>
              <select
                required
                className="input"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="">Select a Payment Method</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Taken from friend(debt)">
                  Taken from friend (debt)
                </option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>

            <BillUpload onUploadSuccess={handleReceiptUpload} />
          </div>

          {/* Right Preview + OCR Section */}
          <div className="right-preview">
            {receiptUrl && (
              <>
                <p>
                  <strong>Preview:</strong>
                </p>
                <img
                  src={receiptUrl}
                  alt="Receipt Preview"
                  className="receipt-preview"
                />
              </>
            )}

            <div className="ocr-debug-box">
              <h4>🔍 OCR Debug Info:</h4>
              <p>
                <strong>Description:</strong> {description}
              </p>
              <p>
                <strong>Amount:</strong> {amount}
              </p>
              <p>
                <strong>Category:</strong> {category}
              </p>
              <p>
                <strong>Payment Method:</strong> {paymentMethod}
              </p>
              {uploading && <p>Processing receipt (OCR + AI)...</p>}
            </div>
          </div>
        </div>

        <div className="center-button">
          <button type="submit" className="button" disabled={uploading}>
            {uploading ? "Processing..." : "Add Record"}
          </button>
        </div>
      </form>
    </div>
  );
};
