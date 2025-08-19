import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { SiweMessage } from "siwe";
import Owner from "../models/Owner";
import { dbConnect } from "./db";

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
        try {
          if (!credentials?.message || !credentials?.signature || !req.headers) {
            return null;
          }

          const siwe = new SiweMessage(JSON.parse(credentials.message));
          const nextAuthUrl = new URL(process.env.NEXTAUTH_URL ?? "http://localhost:3000");
          
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
        await dbConnect();
        
        const userAddress = user.id.toLowerCase();
        const exists = await Owner.exists({ 
          address: userAddress, 
          status: "approved" 
        });

        token.sub = user.id,
        token.isOwner = !!exists;
      }
      return token
    }
  },
  pages: {
    signIn: "/auth",
  },
};

export default authOptions;
