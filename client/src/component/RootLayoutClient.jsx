"use client";
import { Inter } from "next/font/google";
import DraggableTranslator from "./DraggableTranslator";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export default function RootLayoutClient({ children }) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </head>
      <body className={`${inter.variable} antialiased`}>
        {children}
        <DraggableTranslator />
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
