export default async function handler(req, res) {
  // Cookie löschen
  res.setHeader(
    "Set-Cookie",
    "ak_admin=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax; Secure"
  );
  return res.status(200).json({ ok: true });
}
