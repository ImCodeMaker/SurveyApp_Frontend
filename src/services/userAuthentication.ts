// userAuthentication.ts
import { userLogin } from "@/hooks/authHook";
import { userSignup } from "@/hooks/createuserHook";
import { userLogout } from "@/hooks/logoutHook";

export async function loginUser(
  email: string, 
  password: string // Changed from passwordHash
): Promise<ReturnType<typeof userLogin>> {
  try {
    const result = await userLogin(email, password);
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Login failed: ${error.message}`);
    }
    throw new Error('Login failed due to an unknown error');
  }
}

export async function signupUser( 
  email: string, 
  password: string, 
  name: string,
  lastname: string
): Promise<ReturnType<typeof userSignup>> { 
  try {
    const result = await userSignup(email, password, name, lastname);
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Signup failed: ${error.message}`); 
    }
    throw new Error('Signup failed due to an unknown error');
  }
}

export async function Logout(Id: number)
{
  try {
    const logoutHandler = userLogout(Id)
    return logoutHandler
  } catch (error) {
    
  }
}