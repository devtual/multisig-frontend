import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

const authRoutes = [
  "/login",
]

const protectedRoutes = ["/", "/dashboard", "/send-transaction", "/transactions", "/fund"]

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const pathname = req.nextUrl.pathname;

    const isAuthPage = authRoutes.includes(pathname);
  const isProtected = protectedRoutes.includes(pathname);


  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isProtected && !token) {
    const loginUrl = new URL("/login", req.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}
