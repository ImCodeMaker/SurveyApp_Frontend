"use client";
import React, { useEffect, useState } from "react";
import { SessionStorageGetItem } from "@/services/storageservices";
import Explorator from "@/components/explorator";
import DashboardView from "@/components/views/DashboardView";
import CreateSurveys from "@/components/views/CreateSurveys";
import UpdateSurveys from "@/components/views/UpdateSurveys";
import DeleteSurveys from "@/components/views/DeleteSurveys";
import UsersCRUD from "@/components/views/UsersCRUD";
import { Logout } from "@/services/userAuthentication";
import { useRouter } from "next/navigation";

function Page() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true); 
  const [activeContent, setActiveContent] = useState("Dashboard");
  const router = useRouter();
  const userId = Number(SessionStorageGetItem("UserId"));

  const handleNavClick = (itemName: string) => {
    setActiveContent(itemName);
  };

  const isAuthorized = () => {
    try {
      const adminValue = SessionStorageGetItem("isAdmin");
      setIsAdmin(adminValue === "true"); 
      setIsLoading(false);
    } catch (error) {
      console.error("Authorization check failed:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    isAuthorized();
  }, []);

  const renderContent = () => {
    switch (activeContent) {
      case "Dashboard":
        return <DashboardView />;
      case "Create Surveys":
        return <CreateSurveys />;
      case "Update Surveys":
        return <UpdateSurveys />;
      case "Delete Surveys":
        return <DeleteSurveys />;
      case "Users CRUD":
        return isAdmin ? <UsersCRUD /> : <UnauthorizedMessage />; // Additional protection
      default:
        return <DashboardView />;
    }
  };

  const logoutHandler = async (Id: number) => {
    try {
      await Logout(Id);
      setIsAdmin(false);
      router.push("/");
      router.refresh();

    } catch (error) {
      console.error("Logout failed:", error);
      alert("Failed to logout. Please try again.");
    }
  };

  const UnauthorizedMessage = () => (
    <div className="flex justify-center items-center h-full">
      <span className="text-red-600 text-xl">
        You don't have permission to access this section.
      </span>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <>
      {isAdmin ? (
        <div className="h-[100dvh] w-[100dvw] flex justify-center items-center">
          <div className="h-[95dvh] w-[95dvw] bg-gray-50 drop-shadow-xl rounded-md flex flex-col">
            <h1 className="text-center p-4 text-xl font-semibold">
              Admin Panel
            </h1>

            <div className="flex flex-1">
              <Explorator onItemClick={handleNavClick} />
              <div className="flex-1 p-6 bg-white m-4 rounded-lg overflow-auto drop-shadow-2xl relative">
                {renderContent()}
                <div className="absolute bottom-3 right-3">
                  <button
                    onClick={() => logoutHandler(Number(SessionStorageGetItem('UserId')))}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <UnauthorizedMessage />
      )}
    </>
  );
}

export default Page;
