const GW = { 'claude-haiku': 'anthropic/claude-haiku-5.5' };
const OAI = ['gpt-4o', 'gpt-4o-mini'];
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  try {
    const url = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
    const key = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Sin sesión' });
    const u = await fetch(url + '/auth/v1/user', { headers: { apikey: key, Authorization: 'Bearer ' + token } });
    if (!u.ok) return res.status(401).json({ error: 'Sesión no válida' });
    const user = await u.json();
    const allowed = (process.env.ALLOWED_EMAILS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    if (allowed.length && !allowed.includes((user.email || '').toLowerCase()))
      return res.status(403).json({ error: 'Cuenta no autorizada' });
    const { model, system, user: msg, json } = req.body || {};
    const useOpenAI = OAI.includes(model) && process.env.OPENAI_API_KEY;
    let endpoint, auth, m;
    if (useOpenAI) {
      endpoint = 'https://api.openai.com/v1/chat/completions'; auth = process.env.OPENAI_API_KEY; m = model;
    } else {
      endpoint = 'https://ai-gateway.vercel.sh/v1/chat/completions';
      auth = process.env.AI_GATEWAY_API_KEY || req.headers['x-vercel-oidc-token'] || process.env.VERCEL_OIDC_TOKEN;
      m = GW[model] || GW['claude-haiku'];
      if (!auth) return res.status(500).json({ error: 'Sin credenciales de IA' });
    }
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + auth },
      body: JSON.stringify({
        model: m, temperature: 0.8, max_tokens: 2500,
        ...(json && useOpenAI ? { response_format: { type: 'json_object' } } : {}),
        messages: [{ role: 'system', content: String(system || '').slice(0, 30000) }, { role: 'user', content: String(msg || '').slice(0, 30000) }]
      })
    });
    const d = await r.json();
    if (!r.ok) {
      const m = String((d.error && (d.error.message || d.error)) || 'Error del modelo');
      if (/credit card/i.test(m)) return res.status(402).json({ error: 'El narrador Claude necesita que añadas una tarjeta en Vercel (equipo Aitor\'s projects → AI Gateway). Vercel da créditos gratis al añadirla. Mientras tanto no puede narrar.' });
      return res.status(502).json({ error: m });
    }
    let text = d.choices[0].message.content || '';
    if (json) { const i = text.indexOf('{'), k = text.lastIndexOf('}'); if (i >= 0 && k > i) text = text.slice(i, k + 1); }
    res.status(200).json({ text });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
};
