export async function extractTextFromReceipt(imageUrl: string) {
  const formData = new FormData();
  formData.append("url", imageUrl);
  formData.append("language", "eng");
  formData.append("isOverlayRequired", "false");

  const response = await fetch("https://api.ocr.space/parse/image", {
    method: "POST",
    headers: {
      apikey: import.meta.env.VITE_OCR_SPACE_API_KEY,
    },
    body: formData,
  });

  const data = await response.json();

  console.log("🧾 OCR raw response:", data);

  const text: string = data?.ParsedResults?.[0]?.ParsedText || "";
  console.log("📜 Parsed Text:", text);

  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);

  const allAmounts = text.match(/\$?\d{1,3}(?:,\d{3})*(?:\.\d{2})/g) || [];
  const numericAmounts = allAmounts.map(a =>
    parseFloat(a.replace(/[^0-9.]/g, ""))
  );
  const amount = numericAmounts.length ? Math.max(...numericAmounts) : null;

  const itemLines = lines.filter(line =>
    !line.toLowerCase().includes("receipt") &&
    !line.toLowerCase().includes("total") &&
    !line.toLowerCase().includes("thank") &&
    !line.match(/\d{2}[-/]\d{2}[-/]\d{4}/) &&
    !line.match(/\d{1,2}:\d{2}/) &&
    !line.startsWith("$") &&
    line.length > 3
  );

  const description = itemLines.slice(0, 4).join(", ") || "Multiple items";

  let category = "Other";
  if (/shirt|pants|socks|watch|clothes|t-shirt/i.test(description)) {
    category = "Shopping";
  }

  const paymentMethod = "Cash";

  return {
    description,
    amount,
    category,
    paymentMethod,
  };
}
