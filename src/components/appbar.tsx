import React, { useEffect, useState } from "react";
import { MdOutlineKeyboardBackspace } from "react-icons/md";

interface AppbarProps {
  onBackClick?: () => void;
  title:string;
  iconSrc:string;
  rightButton:React.ReactNode;
}

const Appbar: React.FC<AppbarProps> = ({ onBackClick, title, iconSrc, rightButton }) => {
  const [isClient, setIsClient] = useState<boolean>(false)
  useEffect(()=>{
    setIsClient(true)
  },[])
   return (
    <div className="flex items-center justify-between">
      {isClient ? (
        <>
          <button className="flex items-center gap-2 max-mobile:gap-1 px-4 py-2 text-xs max-laptop:px-3 max-mobile:py-2 max-mobile:px-2 rounded-lg bg-white/90 hover:bg-primaryColor/10 shadow border border-gray-200 text-gray-700 max-tablet:text-2xs font-semibold transition-all duration-150 cursor-pointer" onClick={onBackClick}>
              <span className="text-xs">←</span> Back
          </button>
          <div className="text-2xl max-[1340px]:text-[25px] max-laptop:text-[23px] max-tablet:text-[18px] duration-100 font-extrabold flex items-center justify-center gap-2 max-tablet:gap-1 select-none drop-shadow-sm">
              {title} <img src={iconSrc} className="w-8 max-tablet:w-6"/>
          </div>
          {rightButton ? rightButton : <div></div>}
        </>
      ) : (
        <div></div>
      )} 
  </div>
)}
export default Appbar;