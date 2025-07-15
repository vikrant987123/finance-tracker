import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useFinancialRecords } from "../../contexts/financial-record-context";
import { BillUpload } from "../../components/BillUpload";
import { extractTextFromReceipt } from "../../utils/receipt-ocr";

export const FinancialRecodeFrom = () => {
  const [description, setDescription] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [uploading] = useState<boolean>(false); // ← to disable form while OCR runs

  const { addRecord } = useFinancialRecords();
  const { user } = useUser();

  const handleReceiptUpload = async (url: string) => {
  console.log("📄 Receipt uploaded, now calling OCR with URL:", url);
  setReceiptUrl(url);

  try {
    const result = await extractTextFromReceipt(url); // 🧠 OCR logic

    console.log("🔍 OCR Result:", result);

    if (result.description) {
      setDescription(result.description);
      console.log("📝 Description set to:", result.description);
    }

    if (result.amount) {
      setAmount(result.amount.toString());
      console.log("💰 Amount set to:", result.amount);
    }

    if (result.category) {
      setCategory(result.category);
      console.log("🏷️ Category set to:", result.category);
    }

    if (result.paymentMethod) {
      setPaymentMethod(result.paymentMethod);
      console.log("💳 Payment method set to:", result.paymentMethod);
    }

  } catch (err) {
    console.error("❌ OCR failed:", err);
  }
};



  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const newRecord = {
      userId: user?.id ?? "",
      date: new Date(),
      description,
      amount: parseFloat(amount),
      category,
      paymentMethod,
      receiptImage: receiptUrl ?? undefined,
    };

    console.log("🚀 Submitting new record:", newRecord);
    addRecord(newRecord);

    alert("✅ Record added!");

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
              <p><strong>Preview:</strong></p>
              <img src={receiptUrl} alt="Receipt Preview" className="receipt-preview" />
            </>
          )}

          <div className="ocr-debug-box">
            <h4>🔍 OCR Debug Info:</h4>
            <p><strong>Description:</strong> {description}</p>
            <p><strong>Amount:</strong> {amount}</p>
            <p><strong>Category:</strong> {category}</p>
            <p><strong>Payment Method:</strong> {paymentMethod}</p>
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
