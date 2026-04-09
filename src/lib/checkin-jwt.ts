import jwt from "jsonwebtoken";

const CHECKIN_JWT_ALGORITHM: jwt.Algorithm = "HS256";

/** Preferred: stable visitor row id (`sub`). Legacy QRs may use `visitor_token` only (rotates on session login). */
export type VerifiedCheckInClaim =
  | { kind: "visitor_id"; visitorId: string }
  | { kind: "visitor_token"; visitorToken: string };

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    throw new Error("JWT_SECRET is required");
  }
  return secret;
};

/**
 * Turn camera/scanner output into a bare JWT string (trim, BOM, optional Bearer prefix,
 * or JWT embedded in extra text).
 * Uses dot-splitting so base64url padding (`=`) in any segment is preserved (regex-only
 * matching often truncated the signature and made verify fail).
 */
export const normalizeScannedJwt = (raw: string): string => {
  let s = raw.trim().replace(/^\uFEFF/, "");
  s = s.replace(/^["']|["']$/g, "").trim();
  s = s.replace(/^Bearer\s+/i, "").trim();
  s = s.replace(/[\u200B-\u200D\uFEFF]/g, "");
  s = s.replace(/\s/g, "");

  const parts = s.split(".");
  if (parts.length >= 3) {
    return `${parts[0]}.${parts[1]}.${parts[2]}`;
  }

  const embedded = s.match(
    /([A-Za-z0-9_-]+=*)\.([A-Za-z0-9_-]+=*)\.([A-Za-z0-9_-]+=*)/
  );
  if (embedded) {
    return `${embedded[1]}.${embedded[2]}.${embedded[3]}`;
  }

  return s;
};

/** Sign check-in JWT. Use `sub` = visitor_data.id (stable; does not rotate on login). */
export const signCheckInJwt = (
  payload: { sub: string },
  expiresInSeconds?: number
) => {
  const secret = getJwtSecret();

  return jwt.sign(payload, secret, {
    algorithm: CHECKIN_JWT_ALGORITHM,
    expiresIn: expiresInSeconds,
  });
};

export const verifyCheckInJwt = (
  token: string
): VerifiedCheckInClaim => {
  const secret = getJwtSecret();
  const decoded = jwt.verify(token, secret, {
    algorithms: [CHECKIN_JWT_ALGORITHM],
  });

  if (!decoded || typeof decoded === "string") {
    throw new Error("Invalid check-in token payload");
  }

  const sub = decoded.sub;
  if (typeof sub === "string" && sub.trim().length > 0) {
    return { kind: "visitor_id", visitorId: sub.trim() };
  }

  const visitorToken = decoded.visitor_token;
  if (typeof visitorToken === "string" && visitorToken.trim().length > 0) {
    return { kind: "visitor_token", visitorToken: visitorToken.trim() };
  }

  throw new Error("Missing subject or visitor_token in token payload");
};
