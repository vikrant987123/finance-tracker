// client/src/utils/ai.ts
export async function categorizeExpense(description: string): Promise<string> {
  // Gemini uses a different key name and endpoint
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.error("❌ Missing Gemini API key (VITE_GEMINI_API_KEY)");
    return "Other";
  }

  try {
    // Gemini REST endpoint for text generation
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a helpful assistant that classifies financial expenses into one of these categories: Food, Rent, Salary, Utilities, Entertainment, or Other.
Return only the single category name. 
Expense: ${description}`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    console.log("Full Gemini response:", data);

    // Gemini’s result text is in data.candidates[0].content.parts[0].text
    const result =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

    const validCategories = [
      "Food",
      "Rent",
      "Salary",
      "Utilities",
      "Entertainment",
      "Other",
    ];
    if (validCategories.includes(result)) {
      return result;
    }

    return "Other";
  } catch (err) {
    console.error("Gemini API Error:", err);
    return "Other";
  }
}
