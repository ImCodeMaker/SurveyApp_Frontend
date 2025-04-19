import userModel from "@/models/userModel";

export const userSignup = async (
  email: string,
  password_Hash: string,
  name: string,
  lastname: string
): Promise<userModel> => {
  try {
    const response = await fetch(
      "http://localhost:5056/api/UserActions/signup",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password_Hash: password_Hash,
          name: name,
          lastName: lastname,
        }),
      }
    );

    if (!response.ok) throw new Error();

    const data: userModel = await response.json();
    if (data.id && data.id > 0) {
      sessionStorage.setItem("UserId", String(data.id));
    }
    return data;
  } catch (error) {
    throw error;
  }
};
