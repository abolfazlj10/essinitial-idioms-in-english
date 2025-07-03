import React from "react";
import { MdOutlineKeyboardBackspace } from "react-icons/md";

interface AppbarProps {
  onBackClick?: () => void;
  title:String;
  iconSrc:String;
  rightButton:React.ReactNode;
}

const Appbar: React.FC<AppbarProps> = ({ onBackClick, title, iconSrc, rightButton }) => (
    <div className="flex items-center justify-between ">
      <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/90 hover:bg-primaryColor/10 shadow border border-gray-200 text-gray-700 font-semibold transition-all duration-150 cursor-pointer" onClick={onBackClick}>
          <span className="text-lg">←</span> Back
      </button>
      <div className="text-[36px] font-extrabold flex items-center gap-3 select-none drop-shadow-sm">
          {title} <img src={iconSrc} className="w-10 h-10"/>
      </div>
      {rightButton ? rightButton : <div></div>}
  </div>
);

export default Appbar;