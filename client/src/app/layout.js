import { Inter } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { Toaster } from "react-hot-toast";
import GoogleTranslate from "../component/GoogleTranslate";
import { HSCodeProvider } from "../contexts/HSCodeContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "Login",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <HSCodeProvider>
          {children}
        </HSCodeProvider>
        <Toaster position="top-right" />
        <GoogleTranslate />
      </body>
    </html>
  );
}
