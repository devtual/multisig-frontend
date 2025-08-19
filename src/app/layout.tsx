import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Startup from "@/components/Startup";
import { Providers } from "@/components/Providers";
import CustomToastContainer from "@/components/CustomToastContainer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap"
});

export const metadata: Metadata = {
  title: {
    default: 'Tresis Wallet - Secure Multi-Signature Crypto Wallet',
    template: '%s | Secure Multi-Signature Crypto Wallet',
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
      >
      <Providers>
        <CustomToastContainer />
        <Startup>{children}</Startup>
      </Providers>
      </body>
    </html>
  );
}
