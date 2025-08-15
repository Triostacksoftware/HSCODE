import { Inter } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { Toaster } from "react-hot-toast";
import GoogleTranslate from "../component/GoogleTranslate";

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
        {children}
        <Toaster position="top-right" />
        <GoogleTranslate />
      </body>
    </html>
  );
}
