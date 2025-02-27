// D:\IHUB\TRL\login\src\app\api\auth\[...nextauth]\route.ts

import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import bcrypt from "bcryptjs";

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    console.log("checking user")
                    await connectDB();
                    const user = await User.findOne({ email: credentials.email });
                    console.log(user);
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
            console.log("IN THE FOLDER,TOKEN BEFORE ASSIGNMENT: ", token)

            if (user) {
                token.id = user.id as string;
                token.email = user.email;
                token.name = user.name;
            }
            console.log("TOKEN AFTER ASSIGNMENT: ", token);
            return token;
        },
        async session({ session, token }) {
                console.log("SESSION OBJECT BEFORE: ", session);
            if (token.id) {
                session.user = { ...(session.user || {}), id: token.id };
            }

            console.log("SESSION OBJECT AFTER: ", session);
            return session;
            
        },

    },
    pages: {
        signIn: "/",
        signOut: "/"
    },
    secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
