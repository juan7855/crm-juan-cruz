export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método no permitido." });
    return;
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "DEEPSEEK_API_KEY no está configurada en el servidor." });
    return;
  }

  const { messages } = req.body ?? {};
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "Falta el campo 'messages'." });
    return;
  }

  try {
    const upstream = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages,
        temperature: 0.6,
      }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => "");
      res.status(upstream.status).json({ error: `DeepSeek respondió con error: ${detail}` });
      return;
    }

    const data = await upstream.json();
    const reply = data.choices?.[0]?.message?.content?.trim() ?? "";
    res.status(200).json({ reply });
  } catch {
    res.status(502).json({ error: "No se pudo contactar con DeepSeek." });
  }
}
