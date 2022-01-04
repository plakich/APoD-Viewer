import {useState} from "react";

const useToggle = (initialValue) =>
{
    const [isToggled, setValue] = useState(initialValue);
    
    const toggleValue = (value) =>
    {
        setValue(currentVal => typeof value === "boolean" ? value : !currentVal);
    };
    
    return [isToggled, toggleValue]; 
};

export default useToggle;