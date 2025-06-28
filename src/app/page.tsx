"use client";
import { useState } from "react";
import { IoCreate } from "react-icons/io5";
import { FaBookOpen } from "react-icons/fa";
import { PiCardsThreeFill } from "react-icons/pi";
import { MdOutlineFavorite } from "react-icons/md";
import Link from "next/link";

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
    <div className="h-full flex flex-col gap-20">
      <div className="flex flex-col gap-6 text-lg">
        <div className="text-[80px] font-bold select-none">Leran essenitial idioms with <span className="bg-gradient-to-r from-[#4e5996] to-primaryColor bg-clip-text text-transparent">AI</span></div>
      </div>
      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col">
          <div className="text-lg">
            This <span className="bg-hilightColor/30 px-1">AI-powered tool</span> is designed to help you master <span className="bg-hilightColor/30 px-1">essential English idioms</span> in a fun and effective way. With features like the Story Creator, Flash Cards, and a full Book of idioms, it makes learning both <span className="bg-hilightColor/30 px-1">interactive</span> and practical. Whether you're a beginner or looking to improve your fluency, this tool supports your progress by offering structured lessons and <span className="bg-hilightColor/30 px-1">personalized practice</span>. You'll build your vocabulary, understand real-life usage, and <span className="bg-hilightColor" />
            <span className="bg-hilightColor/30 px-1">gain confidence</span> in speaking and writing. The Archives section also helps you save and review what you've learned. It's an ideal companion for daily English improvement.
          </div>
        </div>
        <div className="flex-1 flex justify-center items-center select-none">
          <div className="ring-3 ring-primaryColor rounded-xl w-[700px] h-full relative">
            <img className="w-full rounded-xl h-full object-cover shadow-xl shadow-bgColor" src="./Screenshot 2025-06-16 103128.png" />
            <img className="absolute -top-9 -right-10" src="./icon/Direct Hit.svg"/>
          </div>
        </div>
      </div>
      <div className="font-bold flex flex-col gap-10">
        <div className="text-xl select-none">Quick Access <img className="w-[30px] inline-block" src="./icon/Backhand Index Pointing Down Medium Skin Tone.svg" /></div>
        <div className="flex pr-40 gap-5">
          {quickAccess.map((item,id)=>(
            <QuickAccessCard key={id} icon={item.icon} title={item.title} description={item.description} />
          ))}
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
        <Link href="/story" className="select-none text-sm border text-primaryColor rounded-lg p-2 w-1/2 text-center shadow cursor-pointer hover:bg-primaryColor hover:text-white duration-100">Learn more {'=>'}</Link>
      </div>
    </div>
  );
}