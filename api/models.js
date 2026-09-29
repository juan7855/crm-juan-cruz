export default async function handler(req, res) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "DEEPSEEK_API_KEY no está configurada en el servidor." });
    return;
  }

  try {
    const upstream = await fetch("https://api.deepseek.com/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => "");
      res.status(upstream.status).json({ error: `DeepSeek respondió con error: ${detail}` });
      return;
    }

    const data = await upstream.json();
    const models = (data.data ?? []).map((m) => m.id);
    res.status(200).json({ models });
  } catch {
    res.status(502).json({ error: "No se pudo contactar con DeepSeek." });
  }
}
