const crypto = require("crypto");

function signOAuthState(payload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is required for OAuth state");

  const body = {
    ...payload,
    exp: Date.now() + 10 * 60 * 1000,
  };
  const data = Buffer.from(JSON.stringify(body)).toString("base64url");
  const sig = crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest("base64url");
  return `${data}.${sig}`;
}

function verifyOAuthState(state) {
  const secret = process.env.JWT_SECRET;
  if (!state || !secret) throw new Error("Invalid OAuth state");

  const [data, sig] = String(state).split(".");
  if (!data || !sig) throw new Error("Invalid OAuth state");

  const expected = crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest("base64url");
  if (sig !== expected) throw new Error("Invalid OAuth state");

  const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
  if (!payload.exp || payload.exp < Date.now()) {
    throw new Error("OAuth state expired");
  }
  return payload;
}

module.exports = { signOAuthState, verifyOAuthState };
