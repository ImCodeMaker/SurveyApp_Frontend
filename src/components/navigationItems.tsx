// components/navigationItems.tsx
import React from "react";
import { NavigatorItemsProps } from "@/types/navigationProps";

const NavigatorItemsComponent: React.FC<NavigatorItemsProps> = ({
  image: Icon,
  name,
  onClick
}) => {
  return (
    <div 
      className="flex items-center p-3 w-full hover:bg-gray-100 cursor-pointer"
      onClick={onClick}
    >
      <Icon className="mr-2 h-5 w-5" />
      <span>{name}</span>
    </div>
  );
};

export default NavigatorItemsComponent;