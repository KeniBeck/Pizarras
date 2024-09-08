import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Pizarras",
  description: "Loteria",

};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/Sencillo.svg" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
