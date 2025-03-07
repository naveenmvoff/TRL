import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import bcrypt from "bcryptjs";


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
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // console.log("checking user");
          await connectDB();
          const user = await User.findOne({ email: credentials.email });
          // console.log("User Data", user);
          if (!user) {
            return null;
          }

          const passwordMatch = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!passwordMatch) {
            return null;
          }

          return {
            
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            factory: user.factory,
          };
        } catch (error) {
          console.log("Error: ", error);
          return null;
        }
      },
    }),
  ],
  session: {
    
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    
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
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
