import React from "react";

interface ButtonProps {
  variant: "default" | "outline" | "success" | "error"; // You can expand this list as needed
  className?: string;
  onClick: () => void;
  disabled?: boolean; // Add 'disabled' prop
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ variant, className = "", onClick, disabled = false, children }) => {
  const getVariantStyles = (variant: string) => {
    switch (variant) {
      case "outline":
        return "border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"; // Outline variant style
      case "success":
        return "bg-green-500 text-white hover:bg-green-600";
      case "error":
        return "bg-red-500 text-white hover:bg-red-600";
      default:
        return "bg-blue-600 text-white hover:bg-blue-700";
    }
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg ${getVariantStyles(variant)} ${className} transition-all duration-300`}
      disabled={disabled} // Add disabled attribute to button
    >
      {children}
    </button>
  );
};

export default Button;
