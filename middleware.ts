import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    if (req.nextUrl.pathname.startsWith("/instructor") && token?.role !== "INSTRUCTOR") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  },
  {
    pages: { signIn: "/login" },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/lab/:path*", "/instructor/:path*"],
};
