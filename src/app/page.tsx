"use client";
import React, { useState } from "react";
import InputFields from "@/components/inputfields";
import Button from "@/components/buttons";
import {loginUser} from "@/services/userAuthentication";
import { useRouter } from 'next/navigation'
import { SessionStorageGetItem } from "@/services/storageservices";

function Page() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter()

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const checkAdminStatus = (): void => {
    const adminValue = SessionStorageGetItem('isAdmin');
    

    router.push(adminValue === 'true' ? '/admin' : '/surveys');
  }
  

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    // Basic validation
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const response = await loginUser(formData.email, formData.password);
      console.log(response);

      // Only reset on success
      setFormData({
        email: "",
        password: "",
      });


      checkAdminStatus()

      // Redirect or handle successful login here
    } catch (error) {
      setError(error instanceof Error ? error.message : "Login failed");
      
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <div className="h-[100dvh] w-[100dvw] bg-gray-100 flex justify-center items-center">
      <div className="h-[410px] w-96 bg-white drop-shadow-xl absolute">
        <h1 className="text-center font-semibold text-black text-2xl mt-7">
          Login
        </h1>
        <p className="font-light text-black text-sm text-center">
          Put your credentials here to begin your journey with us.
        </p>

        {error && (
          <div className="text-red-500 text-sm text-center mt-2">{error}</div>
        )}

        <div className="flex justify-center items-center flex-col space-y-3 mt-5">
          <form id="form" onSubmit={handleSubmit}>
            <InputFields
              name="email"
              placeholder="Enter your email here..."
              type="email" // Changed from "text" to "email"
              value={formData.email}
              onChange={handleFormChange}
              labelText="Email"
            />
            <InputFields
              name="password"
              placeholder="Enter your password here..."
              type="password"
              value={formData.password}
              onChange={handleFormChange}
              labelText="Password"
            />
            <div className="flex justify-center items-center mt-4">
              <Button name={loading ? "Processing..." : "Login"}  type="submit"/>
            </div>
            <div className="flex justify-center items-center mt-2">
              <Button  name={'Sign up'} type="button" func={() => router.push('/signup')}/>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Page;
