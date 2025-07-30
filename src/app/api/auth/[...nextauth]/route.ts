import NextAuth, { AuthOptions, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { SiweMessage } from "siwe";
import { getCsrfToken } from "next-auth/react";

declare module "next-auth" {
  interface Session {
    address: string
  }
}

const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Ethereum",
      credentials: {
        message: { label: "Message", type: "text", placeholder: "0x0" },
        signature: { label: "Signature", type: "text", placeholder: "0x0" },
      },
      async authorize(credentials, req) {
        console.log("credentials", credentials)
        try {
          if (!credentials?.message || !credentials?.signature || !req.headers) {
            return null;
          }

          const siwe = new SiweMessage(JSON.parse(credentials.message));
          const nextAuthUrl = new URL(process.env.NEXTAUTH_URL ?? "https://wallet.devtual.com/");
          
          const cookieHeader = req.headers?.cookie
            const cookieNonce = cookieHeader?.match(/siwe-nonce=([^;]+)/)?.[1]


          const result = await siwe.verify({
            signature: credentials.signature,
            domain: nextAuthUrl.host,
            nonce: cookieNonce
          });

          if (!result.success) {
            throw new Error("Invalid signature or nonce");
          }

          if (result.data.statement !== process.env.NEXT_PUBLIC_SIGNIN_MESSAGE) {
            throw new Error("Statement mismatch");
          }

          return { id: siwe.address };
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }) {
      session.address = token.sub!;
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    }
  },
  pages: {
    signIn: "/auth",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };