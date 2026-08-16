"use client";

import Image from "next/image";

interface CheckboxProps {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  icon?: string;
}

export default function Checkbox({
  label,
  checked = false,
  onChange,
  disabled = false,
  icon = "/icons/check.svg",
}: CheckboxProps) {
  const handleClick = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  return (
    <div
      className={`flex items-center gap-3 select-none ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}
      onClick={handleClick}
    >
      <div
        className={`
          w-5 h-5 rounded border-2 flex items-center justify-center
          transition-all duration-200
          ${checked ? "bg-blue-500 border-transparent" : "bg-white border-gray-300"}
          ${!disabled && !checked ? "hover:border-blue-500" : ""}
          ${!disabled ? "hover:shadow-md" : ""}
        `}
      >
        {checked && (
          <Image
            src={icon}
            alt="check"
            width={15}
            height={15}
            className="object-contain"
          />
        )}
      </div>
      <span className="text-gray-700 text-base">{label}</span>
    </div>
  );
}