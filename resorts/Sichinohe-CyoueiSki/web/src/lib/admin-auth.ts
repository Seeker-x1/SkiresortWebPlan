import { timingSafeEqual } from "node:crypto";

export function isAdminAuthorized(req: Request): boolean {
  const authHeader = req.headers.get("authorization");
  const token = process.env.ADMIN_UPDATE_TOKEN;
  if (!token || !authHeader) return false;

  const expected = Buffer.from(`Bearer ${token}`);
  const actual = Buffer.from(authHeader);
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}
