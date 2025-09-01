import { Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { HomeCountryProvider } from "@/contexts/HomeCountryContext";
import { HSCodeProvider } from "@/contexts/HSCodeContext";
import { OnlineUsersProvider } from "@/contexts/OnlineUsersContext";
import FloatingTranslate from "@/component/FloatingTranslate";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "HS Code Finder",
  description: "Find HS Codes for international trade",
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <HomeCountryProvider>
          <HSCodeProvider>
            <OnlineUsersProvider>
              <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
              <FloatingTranslate />
            </OnlineUsersProvider>
          </HSCodeProvider>
        </HomeCountryProvider>
      </body>
    </html>
  );
}
