import ButtonProps from "@/types/buttonprops";

const Button: React.FC<ButtonProps> = ({ name,func,type }) => {
  return (
    <>
      <div className="flex justify-center items-center bg-blue-600 h-10 w-72 mt-3 rounded-sm drop-shadow-2xl">
        <button className="text-white cursor-pointer font-bold"  type={type} onClick={func} >{name}</button>
      </div>
    </>
  );
};

export default Button;
