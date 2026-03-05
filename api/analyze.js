export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { pdfBase64, messages } = req.body;

  if (!pdfBase64) return res.status(400).json({ error: "No PDF provided" });

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: `Tu es un analyste financier expert. Tu analyses des documents financiers (contrats d'assurance, rapports ESG, prospectus d'investissement, contrats de titrisation, etc.) et tu réponds de manière précise, structurée et professionnelle.

Tes réponses sont toujours :
- Claires et bien structurées avec des paragraphes ou bullet points si nécessaire
- Directement liées au contenu du document fourni
- En français
- Adaptées à un contexte fintech/finance

Si une information n'est pas dans le document, dis-le clairement.`,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "document",
                source: { type: "base64", media_type: "application/pdf", data: pdfBase64 },
              },
              { type: "text", text: messages[0].content },
            ],
          },
          ...messages.slice(1).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "API error" });
    }

    const answer = data.content?.map((b) => b.text || "").join("") || "Pas de réponse.";
    res.status(200).json({ answer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
