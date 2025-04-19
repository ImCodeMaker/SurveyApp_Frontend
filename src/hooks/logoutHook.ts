// userAuthentication.ts
import { SessionStorageDeleteItem } from "@/services/storageservices";

export const userLogout = async (userId: number): Promise<boolean> => {
  try {
    // Exact same request as Swagger
    const response = await fetch(
      `http://localhost:5056/api/UserActions/logout/${userId}`,
      {
        method: "POST",
        headers: {
          accept: "*/*", // This is what Swagger sends
        },
        // No body, no content-type
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    
    if (response.ok) {
      SessionStorageDeleteItem("UserId");
      SessionStorageDeleteItem("isAdmin");
    }

    console.log(userId);

    return true;
  } catch (error) {
    console.error("Logout failed:", error);
    throw error;
  }
};
