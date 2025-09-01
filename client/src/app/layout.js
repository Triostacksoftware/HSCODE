import "./globals.css";
import "leaflet/dist/leaflet.css";
import { HSCodeProvider } from "../contexts/HSCodeContext";
import RootLayoutClient from "../component/RootLayoutClient";

export const metadata = {
  title: "Login",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <HSCodeProvider>
      <RootLayoutClient>
        {children}
      </RootLayoutClient>
    </HSCodeProvider>
  );
}