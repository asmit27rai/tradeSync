import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@coinbase/onchainkit/styles.css";
import { WalletProvider } from "@/context/walletContext";
import { Providers } from "@/context/provider";
import { baseSepolia } from "viem/chains";
import { OnchainKitProvider } from "@coinbase/onchainkit";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TradeSync",
  description: "Revolutionizing crypto trading with AI-powered strategies",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <WalletProvider>
          <OnchainKitProvider
            config={{
              appearance: {
                name: "OnchainKit Playground",
                logo: "https://onchainkit.xyz/favicon/48x48.png?v4-19-24",
                mode: "auto",
                theme: "default",
              },
            }}
            chain={baseSepolia}
          >
            <Providers>{children}</Providers>
          </OnchainKitProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
