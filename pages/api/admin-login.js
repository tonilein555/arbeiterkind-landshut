import crypto from "crypto";

function sign(payload, secret) {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(data).digest("base64url");
  return `${data}.${sig}`;
}

function serializeCookie(name, value, opts = {}) {
  const parts = [`${name}=${value}`];

  if (opts.maxAge != null) parts.push(`Max-Age=${opts.maxAge}`);
  if (opts.path) parts.push(`Path=${opts.path}`);
  if (opts.httpOnly) parts.push("HttpOnly");
  if (opts.secure) parts.push("Secure");
  if (opts.sameSite) parts.push(`SameSite=${opts.sameSite}`);

  return parts.join("; ");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  const { password } = req.body || {};
  const adminPassword = process.env.ADMIN_PASSWORD;
  const tokenSecret = process.env.ADMIN_TOKEN_SECRET;

  if (!adminPassword || !tokenSecret) {
    return res.status(500).json({ ok: false, message: "Server not configured" });
  }

  if (!password || password !== adminPassword) {
    return res.status(401).json({ ok: false, message: "Invalid password" });
  }

  const now = Math.floor(Date.now() / 1000);
  const token = sign(
    { admin: true, iat: now, exp: now + 60 * 60 * 24 * 7 }, // 7 Tage
    tokenSecret
  );

  const cookie = serializeCookie("ak_admin", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  res.setHeader("Set-Cookie", cookie);
  return res.status(200).json({ ok: true });
}
