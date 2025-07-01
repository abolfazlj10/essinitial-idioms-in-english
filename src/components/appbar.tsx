import React from "react";
import { MdOutlineKeyboardBackspace } from "react-icons/md";

interface AppbarProps {
  onBackClick?: () => void;
}

const Appbar: React.FC<AppbarProps> = ({ onBackClick }) => (
  <div onClick={onBackClick} className="absolute top-5 -left-7 shadow-xl text-[40px] z-50 bg-primaryColor p-1 rounded-lg hover:scale-105 duration-100">
    <MdOutlineKeyboardBackspace className="text-white z-50 cursor-pointer"/>
  </div>
);

export default Appbar;