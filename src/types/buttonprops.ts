import { MouseEventHandler } from "react";

export default interface ButtonProps {
    name: string;
    func?: MouseEventHandler<HTMLButtonElement>;
    type: "submit" | "button" | "reset";
}