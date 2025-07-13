export async function categorizeExpense(description: string): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    console.error("Missing OpenAI API key");
    return "Other";
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that classifies expenses into categories. Respond with ONLY one of: Food, Rent, Salary, Utilities, Entertainment, or Other.",
          },
          {
            role: "user",
            content: `Categorize this expense: ${description}`,
          },
        ],
        temperature: 0,
        max_tokens: 10,
      }),
    });

    const data = await response.json();
    console.log("Full AI response:", data); // 👈 Log this to inspect

    const result = data.choices?.[0]?.message?.content?.trim();

    // Fallback logic in case AI says something unexpected
    const validCategories = ["Food", "Rent", "Salary", "Utilities", "Entertainment", "Other"];
    if (result && validCategories.includes(result)) {
      return result;
    }

    return "Other";
  } catch (err) {
    console.error("OpenAI API Error:", err);
    return "Other";
  }
}
