import userModel from "@/models/userModel";
import LogoutModel from "@/models/logoutModel";
import { SessionStorageSetItem } from "@/services/storageservices";

export const userLogin = async (
  email: string,
  password_Hash: string
): Promise<userModel> => {
  try {
    const response = await fetch(
      "http://localhost:5056/api/UserActions/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password_Hash: password_Hash,
        }),
      }
    );

    if (!response.ok) {
      throw new Error();
    }

    const serverResults: userModel = await response.json();

    if (serverResults.id >= 1)
      SessionStorageSetItem("UserId", String(serverResults.id));

    if (serverResults.isAdmin == true)
      SessionStorageSetItem("isAdmin", String(serverResults.isAdmin));

    return serverResults;
  } catch (error) {
    throw error;
  }
};


