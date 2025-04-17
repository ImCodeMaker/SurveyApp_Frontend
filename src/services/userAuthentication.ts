import userLogin from "@/hooks/authHook";


export default async function loginUser(
  email: string, 
  passwordHash: string
): Promise<ReturnType<typeof userLogin>> {
  try {
    const result = await userLogin(email, passwordHash);
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Login failed: ${error.message}`);
    }
    throw new Error('Login failed due to an unknown error');
  }
}