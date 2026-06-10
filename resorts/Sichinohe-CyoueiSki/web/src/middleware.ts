import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

function adminPageAllowed(): boolean {
  return (
    process.env.ADMIN_PAGE_ENABLED === "true" ||
    process.env.NODE_ENV !== "production"
  );
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (!adminPageAllowed()) {
      return NextResponse.rewrite(new URL("/not-found", request.url));
    }
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/",
    "/(ja|en)/:path*",
    "/admin/:path*",
    "/((?!api|admin|_next|_vercel|.*\\..*).*)",
  ],
};
