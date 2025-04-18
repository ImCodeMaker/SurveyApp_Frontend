import React from "react";
import InputsProps from "@/types/inputfieldsprops";

const InputFields: React.FC<InputsProps> = ({
  name,
  placeholder,
  type,
  value,
  onChange,
  labelText,
}) => {

 
  return (
    <>
      <div className="flex flex-col">
        <label
          htmlFor={name}
          className="block mb-1 text-sm  text-gray-900 dark:text-white font-bold"
        >
          {labelText}
        </label>
        <input
          type={type}
          className="pl-[15px] bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg h-10 w-72"
          placeholder={placeholder}
          required
          value={value}
          onChange={onChange}
          name={name}
        />
      </div>
    </>
  );
};

export default InputFields;
