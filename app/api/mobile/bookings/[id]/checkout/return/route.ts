import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const url = new URL(req.url);
  const status = url.searchParams.get('status') === 'cancel' ? 'cancel' : 'success';
  // Whitelist scheme to only allow 'rentex' or other known app schemes
  const scheme = url.searchParams.get('app') === 'rentex' ? 'rentex' : 'rentex';
  
  const deepLink = `${scheme}://booking/${id}?payment=${status}`;
  
  // Basic HTML escape function
  const escapeHtml = (unsafe: string) => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const html = `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Zurück zur App…</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; background: #0a0a0a; color: #fff; margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; text-align: center; }
  .card { max-width: 380px; }
  .ok { color: #10b981; font-size: 48px; }
  .fail { color: #ef4444; font-size: 48px; }
  h1 { font-size: 20px; margin: 16px 0 8px; }
  p { color: #9ca3af; font-size: 14px; line-height: 1.5; }
  a.btn { display: inline-block; margin-top: 20px; padding: 12px 24px; background: #DC2626; color: #fff; border-radius: 10px; text-decoration: none; font-weight: 600; }
</style>
</head>
<body>
<div class="card">
  <div class="${status === 'success' ? 'ok' : 'fail'}">${status === 'success' ? '✓' : '✕'}</div>
  <h1>${status === 'success' ? 'Zahlung erfolgreich' : 'Zahlung abgebrochen'}</h1>
  <p>Sie werden zur App zurückgeleitet…</p>
  <a class="btn" href="${escapeHtml(deepLink)}">Zur App</a>
</div>
<script>setTimeout(function(){ window.location.href = ${JSON.stringify(deepLink)}; }, 900);</script>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
