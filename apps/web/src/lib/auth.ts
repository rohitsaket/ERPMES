import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const nextAuthResult = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/sign-in",
    newUser: "/sign-up",
    error: "/auth/error",
    verifyRequest: "/verify-email",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("LOGIN ATTEMPT STARTED", credentials?.email);
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }

        const email = (credentials.email as string).toLowerCase().trim();
        const password = credentials.password as string;

        try {
          console.log("Querying user:", email);
          const user = await prisma.user.findFirst({
            where: { email },
          });

          console.log("User found:", !!user);
          if (!user) {
            console.log("User is null");
            return null;
          }

          if (!user.passwordHash) {
            console.log("User has no passwordHash");
            return null;
          }

          if (user.status === "suspended" || user.status === "disabled") {
            console.log("User is suspended");
            return null;
          }

          console.log("Comparing passwords...");
          const isValid = await bcrypt.compare(password, user.passwordHash);
          console.log("Password valid:", isValid);
          if (!isValid) {
            return null;
          }

          console.log("Login successful!");
          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User",
            companyId: user.companyId || undefined,
            role: user.role || "ADMIN",
          };
        } catch (error) {
          console.error("AUTHORIZE ERROR:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.companyId = (user as any).companyId;
        token.role = (user as any).role;
      }
      if (trigger === "update") {
        const fresh = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, companyId: true, firstName: true, lastName: true },
        });
        if (fresh) {
          token.role = fresh.role;
          token.companyId = fresh.companyId;
          token.name = `${fresh.firstName || ""} ${fresh.lastName || ""}`.trim() || undefined;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).companyId = token.companyId;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
});

export const handlers = nextAuthResult.handlers;
export const auth = nextAuthResult.auth;
export const signIn: any = nextAuthResult.signIn;
export const signOut: any = nextAuthResult.signOut;
