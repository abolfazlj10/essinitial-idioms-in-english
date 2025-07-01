import React from "react";

type GroupButtonOption = {
  label: string;
  icon?: React.ReactNode;
  value: string;
};

type GroupButtonProps = {
  options: GroupButtonOption[];
  value: string;
  onChange: (val: string) => void;
  className?: string;
};

export default function GroupButton({ options, value, onChange, className = "" }: GroupButtonProps) {
  return (
    <div
      className={`inline-flex rounded-xl shadow border border-gray-200 bg-white overflow-hidden ${className}`}
      role="group"
    >
      {options.map((opt, idx) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            className={`
              flex items-center gap-2 px-4 py-2 font-semibold transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-primaryColor
              ${isActive
                ? "bg-primaryColor text-white shadow-md z-10 scale-105"
                : "bg-white text-gray-700 hover:bg-primaryColor/10"}
              ${idx === 0 ? "rounded-l-xl" : ""}
              ${idx === options.length - 1 ? "rounded-r-xl" : ""}
            `}
            aria-pressed={isActive}
            onClick={() => onChange(opt.value)}
          >
            {opt.icon && <span className="text-lg">{opt.icon}</span>}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
} 