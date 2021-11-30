import {useEffect, useState} from "react";

const useMediaQuery = (mediaQuery) =>
{
    const [isMatch, setIsMatch] = useState(false);
    
    useEffect(() =>
    {
        const handleMatch = e => setIsMatch(e.matches);
        const list = window.matchMedia(mediaQuery);
        
        setIsMatch(list.matches);
        
        list.addEventListener("change", handleMatch);
        
        return () => list.removeEventListener("change", handleMatch);
        
    }, [mediaQuery]);
    
    return isMatch; 
    
};

export default useMediaQuery;