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
          <img className="z-10 w-[800px] left-[200px] absolute opacity-20 -bottom-32 select-none  max-[3100px]:-left-[150px]" src="/blob3.svg"/>
          <img className="z-10 w-[500px] left-[500px] absolute top-0 opacity-80 select-none max-[3100px]:left-[200px] max-[2640px]:left-[50px]" src="/blob2.svg"/>
          <img className="z-10 w-[350px] absolute right-[500px] bottom-0 opacity-50 select-none max-[3100px]:right-[400px] max-[2808px]:right-[100px]" src="/blob2.svg"/>
          <div className="h-full w-full max-h-[1200px] max-w-[2000px] mx-60 max-[2000px]:mx-24 max-[1315px]:mx-16 max-tablet:mx-7 border-4 bg-[#fff] shadow-2xl rounded-2xl text-black z-20">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}