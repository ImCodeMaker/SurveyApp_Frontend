// userAuthentication.ts
import { SessionStorageDeleteItems } from "@/services/storageservices";

export const userLogout = async (userId: number): Promise<boolean> => {
  try {
    const userID = userId.toString()

    const response = await fetch(
      "http://localhost:5056/api/UserActions/logout",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body:  userId.toString(),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Clear session storage
    SessionStorageDeleteItems("UserId");
    SessionStorageDeleteItems("isAdmin");

    return true;
  } catch (error) {
    console.error("Logout failed:", error);
    throw new Error("There was an error setting the log-out.");
  }
};