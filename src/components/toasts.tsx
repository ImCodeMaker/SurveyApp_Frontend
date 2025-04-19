import React, { useState, useEffect } from "react";

interface ToastProps {
  title: string;
  description: string;
  variant: "default" | "success" | "error" | "destructive"; // Add destructive variant here
}

const Toast: React.FC<ToastProps> = ({ title, description, variant }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 4000); // Toast will disappear after 4 seconds

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  const getVariantStyles = (variant: string) => {
    switch (variant) {
      case "success":
        return "bg-green-500 text-white";
      case "error":
        return "bg-red-500 text-white";
      case "destructive": // Handle destructive variant
        return "bg-red-700 text-white"; // You can adjust this as needed
      default:
        return "bg-blue-500 text-white";
    }
  };

  return (
    <div
      className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${getVariantStyles(
        variant
      )} transition-opacity duration-300 ease-in-out`}
    >
      <h3 className="font-semibold">{title}</h3>
      <p>{description}</p>
    </div>
  );
};

export default Toast;
