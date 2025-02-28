import NextAuth, { DefaultSession, DefaultJWT } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: string;
    } & DefaultSession["user"];
  }

  interface JWT extends DefaultJWT {
    id: string;
    role?: string;
  }

  interface User {
    id: string;
    role?: string;
    email: string;
    name: string;
  }
}
