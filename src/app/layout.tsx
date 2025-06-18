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
        <div className="relative">
          <img className="w-[800px] absolute opacity-20 -bottom-32 -left-60 select-none" src="/blob3.svg"/>
          <img className="w-[500px] absolute opacity-80 select-none" src="/blob2.svg"/>
          <img className="w-[350px] absolute right-32 bottom-0 opacity-50 select-none" src="/blob2.svg"/>
          <div className="h-dvh flex items-center justify-center py-10 z-20 relative">
            <div className="display w-[1800px] max-h-[1000px] border-4 h-full bg-[#fff] shadow-2xl rounded-2xl text-black p-9 flex flex-col gap-14 relative">
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}