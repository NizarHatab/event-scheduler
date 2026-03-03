import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Event Scheduler",
  description: "Schedule events, track status, and invite others.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
<script
  src="https://main.d13kl6ytikx1f.amplifyapp.com/api/embed/loader?t=v1.2pKuSkhDjGb4L9reBfHl_uUH394LQ78QlsnlChd6mzEeW5n1OYChm1sJ"
  defer
></script>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
