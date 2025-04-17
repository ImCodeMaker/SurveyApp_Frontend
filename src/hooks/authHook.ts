import userModel from "@/models/userModel";

const userLogin = async (
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

    return serverResults;
  } catch (error) {
    throw error;
  }
};

export default userLogin
