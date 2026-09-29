export default async function handler(req, res) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "DEEPSEEK_API_KEY no está configurada en el servidor." });
    return;
  }

  try {
    const upstream = await fetch("https://api.deepseek.com/user/balance", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => "");
      res.status(upstream.status).json({ error: `DeepSeek respondió con error: ${detail}` });
      return;
    }

    const data = await upstream.json();
    res.status(200).json(data);
  } catch {
    res.status(502).json({ error: "No se pudo contactar con DeepSeek." });
  }
}
