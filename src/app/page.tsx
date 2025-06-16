"use client";
import { useState } from "react";
import { IoCreate } from "react-icons/io5";
import { FaBookOpen } from "react-icons/fa";
import { PiCardsThreeFill } from "react-icons/pi";
import { MdOutlineFavorite } from "react-icons/md";
import { PiDotOutlineFill } from "react-icons/pi";

export default function Home() {
  const [quickAccess] = useState([
    {
      icon: <IoCreate />,
      title: "Story Creator",
      description: "Reach a message to any other one of your chicken",
    },
    {
      icon: <FaBookOpen />,
      title: "Book",
      description: "Reach a message to any other one of your chicken",
    },
    {
      icon: <PiCardsThreeFill />,
      title: "Flash Cards",
      description: "Reach a message to any other one of your chicken",
    },
    {
      icon: <MdOutlineFavorite />,
      title: "Archives",
      description: "Reach a message to any other one of your chicken",
    }
  ]);
  return (
    <div className="relative">
      <img className="w-[800px] absolute opacity-20 -bottom-32 -left-60" src="/blob3.svg"/>
      <img className="w-[500px] absolute opacity-80" src="/blob2.svg"/>
      <img className="w-[350px] absolute right-32 bottom-0 opacity-50" src="/blob2.svg"/>
      <div className="h-dvh flex items-center justify-center py-10 z-20 relative">
        <div className="display w-[1800px] max-h-[1000px] border-4 h-full bg-[#fff] shadow-2xl rounded-2xl text-black p-9 flex flex-col gap-10">
          <div className="flex flex-col gap-6 text-lg">
            <div className="text-[80px] font-bold ">Leran essenitial idioms with <span className="bg-gradient-to-r from-[#4e5996] to-primaryColor bg-clip-text text-transparent">AI</span></div>
          </div>
          <div className="flex-1 flex">
            <div className="flex-1 flex items-center">
            <PiDotOutlineFill className="text-3xl" /> with this platform you can learn idioms easyerliy
            </div>
            <div className="flex-1 flex justify-center items-center">
              <div className="ring-2 ring-primaryColor rounded-xl w-[700px] relative">
                <img className="w-full rounded-xl h-full object-cover" src="./Screenshot 2025-06-16 103128.png" />
                <img className="absolute -top-6 -right-10" src="./icon/Direct Hit.svg"/>
              </div>
            </div>
          </div>
          <div className="font-bold flex flex-col gap-10">
            <div className="text-xl">Quick Access <img className="w-[30px] inline-block" src="./icon/Backhand Index Pointing Down Medium Skin Tone.svg" /></div>
            <div className="flex pr-40 gap-5">
              {quickAccess.map((item,id)=>(
                <QuickAccessCard key={id} icon={item.icon} title={item.title} description={item.description} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface QuickAccessCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function QuickAccessCard({icon, title, description}: QuickAccessCardProps) {
  return (
    <div className="flex flex-col gap-5 border rounded-3xl pl-6 pr-14 py-8 bg-[#f9f9f9]/30 shadow-lg">
      <div className="bg-[#5c6bec] text-white rounded-full self-start p-2 text-2xl">
        {icon}
      </div>
      <div className="text-justify space-y-3">
        <div>{title}</div>
        <div className="text-sm text-gray-500 font-medium pb-2">{description}</div>
        <div className="text-sm border text-primaryColor rounded-lg p-2 w-1/2 text-center shadow cursor-pointer hover:bg-primaryColor hover:text-white duration-100">Learn more =></div>
      </div>
    </div>
  );
}
