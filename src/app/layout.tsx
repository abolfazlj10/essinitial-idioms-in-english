import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "Essential Idioms in English",
  description: "Essential Idioms in English",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
