const https = require('https');

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

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not set" });
  }

  const firstQuestion = messages[0].content;
  const followUpMessages = messages.slice(1).map(m => ({
    role: m.role,
    content: m.content,
  }));

  const requestBody = JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    system: "Tu es un analyste financier expert. Tu analyses des documents financiers (contrats d'assurance, rapports ESG, prospectus d'investissement, etc.) et tu réponds de manière précise, structurée et professionnelle en français.",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: { type: "base64", media_type: "application/pdf", data: pdfBase64 },
          },
          { type: "text", text: firstQuestion },
        ],
      },
      ...followUpMessages,
    ],
  });

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: requestBody,
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "Anthropic API error" });
    }

    const answer = data.content?.map(b => b.text || "").join("") || "Pas de réponse.";
    return res.status(200).json({ answer });

  } catch (err) {
    return res.status(500).json({ error: "Erreur serveur : " + err.message });
  }
};
