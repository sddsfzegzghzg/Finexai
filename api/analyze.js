const pdfParse = require("pdf-parse");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { pdfBase64, messages } = req.body;
  if (!pdfBase64 || !messages || messages.length === 0) {
    return res.status(400).json({ error: "Missing pdfBase64 or messages" });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GROQ_API_KEY not set" });

  // Extract text from PDF
  let pdfText = "";
  try {
    const buffer = Buffer.from(pdfBase64, "base64");
    const parsed = await pdfParse(buffer);
    pdfText = parsed.text.slice(0, 12000); // limit to avoid token overflow
  } catch (err) {
    return res.status(500).json({ error: "Impossible de lire le PDF : " + err.message });
  }

  const firstQuestion = messages[0].content;
  const history = messages.slice(1).map(m => ({ role: m.role, content: m.content }));

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        max_tokens: 1024,
        messages: [
          {
            role: "system",
            content: "Tu es un analyste financier expert. Tu analyses des documents financiers (contrats d'assurance, rapports ESG, prospectus, term sheets, etc.) et tu réponds de manière précise et structurée en français. Réponds uniquement en te basant sur le contenu du document fourni.",
          },
          {
            role: "user",
            content: `Voici le contenu extrait d'un document financier :\n\n${pdfText}\n\n---\n\nQuestion : ${firstQuestion}`,
          },
          ...history,
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "Groq API error" });
    }

    const answer = data.choices?.[0]?.message?.content || "Pas de réponse.";
    return res.status(200).json({ answer });

  } catch (err) {
    return res.status(500).json({ error: "Erreur serveur : " + err.message });
  }
};
