import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

const authRoutes = ["/login"];

const protectedRoutes = ["/", "/dashboard", "/send-transaction", "/transactions", "/submit-request", "/owners"]
const ownerRoutes = ["/fund", "/transactions/new"]

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const pathname = req.nextUrl.pathname;

  const isAuthRoute = authRoutes.includes(pathname);
  const isProtectedRoute = protectedRoutes.includes(pathname);
  const isOwnerRoute = ownerRoutes.includes(pathname);
  
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (isOwnerRoute) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (!token.isOwner) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next()
}
