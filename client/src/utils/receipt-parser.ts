export const parseReceiptText = (text: string) => {
  const amountMatch = text.match(/(?:total|amount)[^\d]*(\d+(\.\d{1,2})?)/i);
  const dateMatch = text.match(/(?:date)[^\d]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
  const methodMatch = text.match(/(?:cash|upi|card|credit|debit)/i);

  return {
    amount: amountMatch?.[1] ?? "0",
    date: dateMatch?.[1] ?? new Date().toISOString(),
    paymentMethod: methodMatch?.[0] ?? "Other",
    category: "Other", // You can later add AI logic here
    description: "Scanned Bill"
  };
};
