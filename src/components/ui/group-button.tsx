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
  clickedButton?: string | null;
};

export default function GroupButton({ options, value, onChange, className = "", clickedButton }: GroupButtonProps) {
  return (
    <div
      className={`inline-flex rounded-xl shadow border border-gray-200 bg-white overflow-hidden ${className}`}
      role="group"
    >
      {options.map((opt, idx) => {
        const isActive = value === opt.value;
        const isClicked = clickedButton === opt.value;
        // Custom color for language group (if present)
        let activeBg = 'bg-primaryColor';
        let activeText = 'text-white';
        if (opt.value === 'en') { activeBg = 'bg-blue-500'; activeText = 'text-white'; }
        if (opt.value === 'fa') { activeBg = 'bg-green-500'; activeText = 'text-white'; }
        if (opt.value === 'all') { activeBg = 'bg-gray-700'; activeText = 'text-white'; }
        return (
          <button
            key={opt.value}
            type="button"
            className={`
              flex items-center gap-2 px-4 py-2 font-semibold transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-primaryColor/40
              ${isActive ? `${activeBg} ${activeText} shadow-md scale-[1.04]` : 'bg-white text-gray-700 hover:bg-primaryColor/10'}
              ${isClicked ? 'scale-105' : ''}
              ${idx === 0 ? "rounded-l-xl" : ""}
              ${idx === options.length - 1 ? "rounded-r-xl" : ""}
            `}
            style={{ boxShadow: isActive ? '0 2px 12px 0 rgba(92,107,236,0.10)' : 'none', border: 'none' }}
            aria-pressed={isActive}
            onClick={() => onChange(opt.value)}
          >
            {opt.icon && (
              <span
                className={`text-lg transition-all duration-150 ${isActive ? activeText : isClicked ? 'text-primaryColor scale-125' : ''}`}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                {opt.icon}
              </span>
            )}
            {opt.label && (
              <span className={`transition-all duration-150 ml-1 ${isActive ? activeText + ' font-bold' : ''}`}>{opt.label}</span>
            )}
          </button>
        );
      })}
    </div>
  );
} 