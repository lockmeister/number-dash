const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { ...CORS, 'content-type': 'application/json; charset=utf-8' },
  });
}

function clean(value, max = 200) {
  if (value == null) return '';
  return String(value).slice(0, max);
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });
    const url = new URL(request.url);

    if (url.pathname === '/track' && request.method === 'POST') {
      let body = {};
      try { body = await request.json(); } catch {}
      const cf = request.cf || {};
      const ua = request.headers.get('user-agent') || '';
      const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || '';
      const now = new Date().toISOString();

      await env.DB.prepare(`
        INSERT INTO events (
          ts, event, player_name, ip, country, region, city, timezone, latitude, longitude,
          user_agent, url, referrer, session_id, score, bonus, lives, medals, details
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        now,
        clean(body.event, 60),
        clean(body.playerName, 80),
        clean(ip, 80),
        clean(cf.country, 40),
        clean(cf.region, 120),
        clean(cf.city, 120),
        clean(cf.timezone, 80),
        clean(cf.latitude, 40),
        clean(cf.longitude, 40),
        clean(ua, 500),
        clean(body.url, 500),
        clean(request.headers.get('referer') || body.referrer, 500),
        clean(body.sessionId, 80),
        Number.isFinite(body.score) ? body.score : null,
        Number.isFinite(body.bonus) ? body.bonus : null,
        Number.isFinite(body.lives) ? body.lives : null,
        Number.isFinite(body.medals) ? body.medals : null,
        JSON.stringify(body.details || {})
      ).run();

      return json({ ok: true });
    }

    if (url.pathname === '/events' && request.method === 'GET') {
      const auth = request.headers.get('authorization') || '';
      if (!env.ADMIN_TOKEN || auth !== `Bearer ${env.ADMIN_TOKEN}`) return json({ error: 'unauthorized' }, 401);
      const limit = Math.min(Number(url.searchParams.get('limit') || 50), 500);
      const result = await env.DB.prepare('SELECT * FROM events ORDER BY id DESC LIMIT ?').bind(limit).all();
      return json(result.results || []);
    }

    return json({ ok: true, endpoints: ['/track', '/events?limit=50'] });
  }
};
