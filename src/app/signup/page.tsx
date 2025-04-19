"use client";
import React, { useState } from "react";
import InputFields from "@/components/inputfields";
import Button from "@/components/buttons";
import { signupUser } from "@/services/userAuthentication";
import { useRouter } from 'next/navigation'
import { sign } from "crypto";

function SignUp() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    lastname: ""
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
      const response = await signupUser(formData.email, formData.password,formData.name,formData.lastname);
      console.log(response);
      
      setFormData({
        email: "",
        password: "",
        name: "",
        lastname: ""
      });

      router.push('/surveys')
      
    } catch (error) {
      setError(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[100dvh] w-[100dvw] bg-gray-100 flex justify-center items-center">
      <div className="h-[450px] w-96 bg-white drop-shadow-xl absolute">
        <h1 className="text-center font-semibold text-black text-2xl mt-7">
          Sign up
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
            <InputFields
              name="name"
              placeholder="Enter your Name here..."
              type="text"
              value={formData.name}
              onChange={handleFormChange}
              labelText="Name"
            />
            <InputFields
              name="lastname"
              placeholder="Enter your Last Name here..."
              type="text"
              value={formData.lastname}
              onChange={handleFormChange}
              labelText="Last Name"
            />
            <div className="flex justify-center items-center mt-4">
              <Button name={"Start your journey!"} type="submit"/>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
