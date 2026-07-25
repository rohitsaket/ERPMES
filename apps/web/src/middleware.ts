import { auth } from "@/lib/auth-middleware";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const publicRoutes = [
    "/sign-in",
    "/sign-up",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/auth/error",
    "/api/auth",
    "/_error",
    "/_not-found",
  ];

  const isPublicRoute = publicRoutes.some((route) => nextUrl.pathname.startsWith(route));

  if (!isLoggedIn && !isPublicRoute) {
    const signInUrl = new URL("/sign-in", nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (isLoggedIn && (nextUrl.pathname === "/sign-in" || nextUrl.pathname === "/sign-up")) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next|monitoring).*)", "/", "/(api|trpc)(.*)"],
};
