import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    const { pathname } = request.nextUrl;

    // Public paths that don't require authentication
    const isPublicPath = pathname === "/" || 
                        pathname.startsWith("/_next") || 
                        pathname.startsWith("/api/auth") ||
                        pathname === "/favicon.ico";

    const isAuthenticated = !!token;
    const isAuthPage = pathname === "/";

    if (isAuthenticated) {
      if (isAuthPage) {
        const role = token.role as string;
        switch (role) {
          case "Admin":
            return NextResponse.redirect(new URL("/admin/product-management", request.url));
          case "Product Manager":
            return NextResponse.redirect(new URL("/productManager/dashboard", request.url));
          case "Stakeholders":
            return NextResponse.redirect(new URL("/stakeholder", request.url));
          default:
            return NextResponse.redirect(new URL("/unauthorized", request.url));
        }
      }

      // Role-based access control
      if (pathname.startsWith('/admin') && token.role !== 'Admin') {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
      if (pathname.startsWith('/productManager') && token.role !== 'Product Manager') {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
      if (pathname.startsWith('/stakeholder') && token.role !== 'Stakeholders') {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    } else if (!isPublicPath) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|images).*)',
  ],
};