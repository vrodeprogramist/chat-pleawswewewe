interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  onClick,
  disabled = false,
  fullWidth = false,
  className = "", // Добавляем пропс className по умолчанию пустая строка
}: ButtonProps) {

  const colors = {
    primary: `
      bg-red-950 
      hover:bg-red-900 
      hover:shadow-[4px_4px_12px_rgba(110,0,0,0.3)]
      active:bg-transparent
      active:text-red-950
      active:shadow-[inset_0_0_0_2px_rgb(53,0,35)]
      disabled:bg-gray-300
      disabled:text-gray-500
      disabled:cursor-not-allowed
      disabled:hover:shadow-none
      text-white
    `,
    
    secondary: `
      bg-gray-200 
      hover:bg-gray-300 
      hover:shadow-[4px_4px_12px_rgba(0,0,0,0.1)]
      active:bg-transparent
      active:text-gray-700
      active:shadow-[inset_0_0_0_2px_rgb(55,65,81)]
      disabled:bg-gray-100
      disabled:text-gray-400
      disabled:cursor-not-allowed
      disabled:hover:shadow-none
      text-gray-800
    `,
    
    outline: `
      border-2 border-gray-300 
      hover:shadow-[4px_4px_12px_rgba(0,0,0,0.1)]
      hover:bg-gray-100
      active:bg-transparent
      active:text-gray-700
      active:!border-transparent
      active:shadow-[inset_0_0_0_2px_rgb(200,200,200)]
      disabled:bg-gray-100
      disabled:text-gray-400
      disabled:cursor-not-allowed
      disabled:hover:shadow-none
      text-gray-800
    `,
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-2.5 text-base",
    lg: "px-8 py-3 text-lg",
  };

  const baseStyles = "font-medium rounded-lg transition-all duration-150 justify-center";
  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button
      className={`
        ${baseStyles} 
        ${widthStyle} 
        ${colors[variant]} 
        ${sizes[size]}
        ${className} // Добавляем переданный className в конец (для переопределения стилей)
      `.replace(/\s+/g, ' ').trim()} // Убираем лишние пробелы
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}