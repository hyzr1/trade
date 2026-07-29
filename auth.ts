// auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // Every signed-in user is Pro for now (Stripe gating lands later)
      (session.user as { tier?: "free" | "pro" }).tier = "pro";
      return session;
    },
  },
  pages: {
    // No custom pages yet — NextAuth default works fine
  },
});
