import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  // CORS (allow Carrd)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, business_info } = req.body;

  if (!message) {
    return res.status(400).json({ error: "No message provided" });
  }

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a customer service assistant for ONE specific business.\n" +
            "You MUST base answers on the Business Info provided.\n" +
            "If Business Info does not contain the needed detail (hours/policy/pricing/warranty/etc), DO NOT guess.\n" +
            "Instead ask 1–2 clarifying questions OR suggest escalating to the business.\n" +
            "Write a clear, polite, human-sounding reply.\n" +
            "Never mention AI."
        },
        {
          role: "user",
          content:
            `Business Info:\n${business_info || "(none provided)"}\n\nCustomer message:\n${message}`
        }
      ]
    });

    return res.status(200).json({
      reply: completion.choices[0].message.content
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "AI generation error" });
  }
}
