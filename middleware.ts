import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Simple CORS middleware for Next.js app router API routes.
 *
 * Set `ALLOWED_ORIGIN` in your environment to the frontend origin (e.g. https://your-app.vercel.app)
 * or leave unset to echo the request Origin header. Be careful with `*` in production.
 */
export function middleware(req: NextRequest) {
  const origin = req.headers.get("origin") || "*";
  const allowed = process.env.ALLOWED_ORIGIN || origin || "*";

  // Prepare common CORS headers
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", allowed);
  headers.set(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  headers.set("Access-Control-Allow-Credentials", "true");

  // Respond to preflight requests immediately
  if (req.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers });
  }

  const res = NextResponse.next();
  // Apply headers to the response
  headers.forEach((value, key) => res.headers.set(key, value));
  return res;
}

export const config = {
  matcher: ["/api/:path*"],
};
