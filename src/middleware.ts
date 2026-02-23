import { auth } from "@/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register");
  const isInvitePage = req.nextUrl.pathname.startsWith("/invite/");
  const isPublic = isAuthPage || isInvitePage || req.nextUrl.pathname === "/";

  if (isPublic && !isLoggedIn && req.nextUrl.pathname === "/") {
    return Response.redirect(new URL("/dashboard", req.url));
  }
  if (isPublic) return undefined;
  if (!isLoggedIn) {
    return Response.redirect(new URL("/login", req.url));
  }
  return undefined;
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
