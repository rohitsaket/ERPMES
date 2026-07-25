import NextAuth from "next-auth";

const nextAuthResult = NextAuth({
  providers: [],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    async jwt({ token }) {
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        (session.user as any).companyId = token.companyId;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
});

export const { auth } = nextAuthResult;
