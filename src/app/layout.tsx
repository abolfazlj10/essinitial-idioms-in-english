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
        <div className="relative min-h-screen max-h-screen min-w-screen max-w-screen h-screen w-screen flex justify-center items-center py-22 z-10">
          <img className="z-10 w-[800px] absolute opacity-20 -bottom-32 -left-60 select-none" src="/blob3.svg"/>
          <img className="z-10 w-[500px] absolute left-0 top-0 opacity-80 select-none" src="/blob2.svg"/>
          <img className="z-10 w-[350px] absolute right-32 bottom-0 opacity-50 select-none" src="/blob2.svg"/>
          <div className="h-full w-full mx-60 border-4 bg-[#fff] shadow-2xl rounded-2xl text-black z-20">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}