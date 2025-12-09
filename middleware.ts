import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";

export function middleware(req: NextRequest) {   
  const res = NextResponse.next();

  // 1. Read cookie
  const cookieUserId = req.cookies.get("user_id")?.value;

  // 2. If cookie exists → attach header
  if (cookieUserId) {
    res.headers.set("x-user-id", cookieUserId);
    return res;
  }

  // 3. Create new anonymous ID
  const newId = uuid();

  // Set httpOnly cookie
  res.cookies.set("user_id", newId, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365 // 1 year
  });

  // Attach header for backend
  res.headers.set("x-user-id", newId);

  return res;
}

export const config = {
  matcher: "/:path*",
};
