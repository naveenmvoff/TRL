// // // // // D:\IHUB\TRL\login\middleware.ts


import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // console.log("Middleware Running!")
    console.log("Middleware running - Path:", req.nextUrl.pathname);

    const isAuth = !!req.nextauth?.token;
    const isAuthPage = req.nextUrl.pathname === "/";
    const requestedPage = req.nextUrl.pathname;

    // const requestedPage = req.nextUrl.pathname;
    // const isAuthPage = requestedPage === "/";

    if (isAuthPage && isAuth) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (!isAuthPage && !isAuth) {
      return NextResponse.redirect(new URL("/", req.url));
     
    }

    return NextResponse.next();
  },
);

export const config = {
  matcher: ["/", "/extra", "/dashboard","/*", "/dummy", "/api/auth/callback/:path*", ],
};



// // // // // // D:\IHUB\TRL\login\middleware.ts


// import { withAuth } from "next-auth/middleware";
// import { NextResponse } from "next/server";

// export default withAuth(
//   function middleware(req) {
//     // console.log("Middleware Running!")
//     console.log("Middleware running - Path:", req.nextUrl.pathname);

//     // const isAuth = req.nextauth?.token;
//     // const isAuthPage = req.nextUrl.pathname === "/";
//     // const requestedPage = req.nextUrl.pathname;

//     const requestedPage = req.nextUrl.pathname;
//     const isAuthPage = requestedPage === "/";

//     if (isAuthPage) {
//       // if (isAuth) {
//       //   // // Define your redirection logic here
//       //   // let redirectUrl = "/extra"; // default

//       //   // // You can add conditions based on user roles or other factors
//       //   // if (requestedPage === "/extra") {
//       //   //   redirectUrl = "/extra";
//       //   // } else if (requestedPage === "/dummy") {
//       //   //   redirectUrl = "/dummy";
//       //   // }

//       //   // // return NextResponse.redirect(new URL(redirectUrl, req.url));

//       // }
//       return NextResponse.redirect(new URL("/extra", req.url));

//       // return null;

//       // return NextResponse.next(); // Allow authenticated users to access protected routes
//     }

//       // if (!isAuth) {
//       //   // // Store the requested URL as a callback
//       //   // const callbackUrl = requestedPage;
//       //   // return NextResponse.redirect(
//       //   //   new URL(`/?callbackUrl=${callbackUrl}`, req.url)
//       //   // );

//       //   return NextResponse.redirect(
//       //     new URL(`/?callbackUrl=${encodeURIComponent(requestedPage)}`, req.url)
//       //   );
//       // }

//     return NextResponse.next();
//   },
//   {
//     callbacks: {
//       authorized: ({ token }) => {
//         console.log("Checking token in middleware:", token);
//         return !!token; // Only allow if token exists
//       }
//     },
//   }
// );

// export const config = {
//   matcher: ["/", "/extra", "/dashboard","/*" ],
// };
