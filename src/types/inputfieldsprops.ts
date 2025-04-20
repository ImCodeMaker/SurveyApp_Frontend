import { ChangeEventHandler } from "react";

export default interface InputsProps{
    name: string,
    placeholder: string,
    type: string,
    value: string,
    onChange?: ChangeEventHandler<HTMLInputElement> 
    labelText: string
}