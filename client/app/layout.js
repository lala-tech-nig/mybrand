import { Geist, Geist_Mono } from "next/font/google"; // Keep font imports
import "./globals.css";
import NavbarWrapper from "../components/NavbarWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "my Brand - Digital Identity for Businesses",
  description: "Create your free digital business card and social identity.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <NavbarWrapper />
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
