import crypto from "crypto";

function verify(token, secret) {
  const [data, sig] = (token || "").split(".");
  if (!data || !sig) return null;

  const expected = crypto.createHmac("sha256", secret).update(data).digest("base64url");
  if (expected !== sig) return null;

  const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
  const now = Math.floor(Date.now() / 1000);
  if (!payload?.admin) return null;
  if (payload?.exp && payload.exp < now) return null;
  return payload;
}

function parseCookies(cookieHeader = "") {
  const out = {};
  cookieHeader.split(";").forEach((part) => {
    const [k, ...v] = part.trim().split("=");
    if (!k) return;
    out[k] = v.join("=");
  });
  return out;
}

export default async function handler(req, res) {
  const secret = process.env.ADMIN_TOKEN_SECRET;
  if (!secret) return res.status(500).json({ ok: false });

  const cookies = parseCookies(req.headers.cookie || "");
  const payload = verify(cookies.ak_admin, secret);

  return res.status(200).json({ ok: !!payload });
}
