import Link from "next/link";

interface QuickAccessCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

export default function QuickAccessCard({icon, title, description}: QuickAccessCardProps) {
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