import React, { useEffect, useState } from "react";
import { NavigatorItems } from "@/types/navigationProps";
import { ChartArea, SquarePen, BookOpenText, User, CopyX } from "lucide-react";
import NavigatorItemsComponent from "./navigationItems";

function Explorator({ onItemClick }: { onItemClick: (itemName: string) => void }) {
  const [navItems, setNavbarItems] = useState<NavigatorItems[] | null>();

  useEffect(() => {
    setNavbarItems([
      { image: ChartArea, name: "Dashboard" },
      { image: SquarePen, name: "Create Surveys" },
      { image: BookOpenText, name: "Update Surveys" },
      { image: CopyX, name: "Delete Surveys" },
    ]);
  }, []);

  return (
    <div className="w-[300px] h-[400px] bg-white ml-6 drop-shadow-lg rounded-md flex flex-col items-center py-4">
      <h1 className="text-xl font-semibold mb-4">Navigation</h1>
      <div className="w-full flex-1 overflow-y-auto">
        {navItems?.map((nav) => (
          <NavigatorItemsComponent
            key={nav.name}
            image={nav.image}
            name={nav.name}
            onClick={() => onItemClick(nav.name)}
          />
        ))}
      </div>
    </div>
  );
}

export default Explorator;
