import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import bcrypt from "bcryptjs";

interface UserDocument {
  _id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  factory: string;
  __v: number;
}

declare module 'next-auth' {
    interface User {
      role?: string;
      factory?: string | null;
    }
    interface Session {
      user: {
        id: string;
        name?: string | null;
        email?: string | null;
        role?: string | null;
        factory?: string | null;
      }
    }
  }

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          await connectDB();
          const user = await User.findOne({ email: credentials.email }).lean().exec() as UserDocument | null;

          if (!user) {
            throw new Error("Invalid email or password");
          }

          const passwordMatch = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!passwordMatch) {
            throw new Error("Invalid email or password");
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            factory: user.factory,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      // console.log("USER BEFORE: ", user);
      // console.log("IN THE FOLDER,TOKEN BEFORE ASSIGNMENT: ", token);

      if (user) {
        token.id = user.id as string;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.factory = user.factory;
      }
      // console.log("TOKEN AFTER ASSIGNMENT: ", token);
      // console.log("USER AFTER : ", user);
      // console.log("this.Session in JWT: ", this.session);

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          name: token.name,
          email: token.email,
          role: token.role as string,
          factory: token.factory as string

        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
    signOut: "/",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
