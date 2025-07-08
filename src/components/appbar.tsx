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
      <button className="flex items-center gap-2 px-4 py-2 max-laptop:px-3 rounded-lg bg-white/90 hover:bg-primaryColor/10 shadow border border-gray-200 text-gray-700 max-laptop:text-sm font-semibold transition-all duration-150 cursor-pointer" onClick={onBackClick}>
          <span className="text-lg max-[1340px]:text-base max-laptop:text-sm">←</span> Back
      </button>
      <div className="text-[36px] max-[1340px]:text-[25px] max-laptop:text-[23px] duration-100 font-extrabold flex items-center justify-center gap-3 select-none drop-shadow-sm">
          {title} <img src={iconSrc} className="w-10"/>
      </div>
      {rightButton ? rightButton : <div></div>}
  </div>
);

export default Appbar;