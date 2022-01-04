import {useEffect, useState, useRef} from "react";

/*
    Hook for infinite scroll. Hook doesn't actually initiate 
    fetch (except for initial fetch) but gives us the logic
    to do so inside our components.
    
    @param {String} initialUrl - a string for a url/api endpoint
    @param {*} initialData - format expected for your data
    @param {object} initialOptions - see fetch init object for full list 
        of option props (https://developer.mozilla.org/en-US/docs/Web/API/fetch)
    @param {number} scrollEnd - number from 0 to 100 indicating
        what percentage of the page should be scrolled before isScrolled is set true
        
    @returns {array} - array with object (with bools and data) and methods (for fetching data)
        @returns {object} .error - type of error fetch returned, if any (has message prop)
        @returns {boolean} .isScrolled - indicates whether page is scrolled scrollEnd amount
        @returns {boolean} .isLoading - true if fetch promise is still pending, false otherwise
        @returns {*} .data - data returned from successful fetch operation
        @returns {Function} setUrl - a function to set url. Fetches more data when called.
        @returns {Function} setOptions - a function to set fetch init object. 
            Fetches more data when changed. 
    
*/
const useFetchOnScroll = (initialUrl, initialData = [], initialOptions = {method: "GET"}, scrollEnd = 100) => 
{
    const [url, setUrl] = useState(initialUrl); 
    const [data, setData] = useState(initialData);
    const [options, setOptions] = useState(initialOptions);
    const [isScrolled, setIsScrolled] = useState(true);
    const [isLoading, setIsLoading] = useState(true); 
    const [error, setError] = useState(null); 
    const abortRef = useRef(null); 
    
    
    useEffect(() =>
    {
        const handleScroll = (e) =>
        {
            const bodyPercentScrolled = ( (window.innerHeight + window.scrollY) / document.body.scrollHeight) * 100; 
    
            if (bodyPercentScrolled >= scrollEnd) 
            {
                setIsScrolled(true); 
            }
            else
            {
                setIsScrolled(false); 
            }
        };
        
        window.addEventListener("scroll", handleScroll);
        // need to consider resize events here too
        // as a user might resize a screen to where
        // the viewport then covers 100 percent of the body,
        // in which case, we'd want isScrolled to be true
        window.addEventListener("resize", handleScroll); 
        
        return () => 
        {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleScroll); 
        };
        
    }, [scrollEnd]);
    
    useEffect(() =>
    {
        
        const fetchData = async () =>
        {
          
            setIsLoading(true);
            
            // We use an AbortController's signal 
            // property to cancel a previously made 
            // request that's still pending while a new 
            // one arrives. This prevents race conditions
            // where the data (apod in our App) can 
            // potentially become out of sync/obsolete. 
            if (abortRef.current)
            {
                abortRef.current.abort(); 
            }
            
            abortRef.current = new AbortController(); 
            
            // we only copied state so we can attach signal below
            const newOptions = {...options};
            newOptions.signal = abortRef.current.signal; 
            
            try
            {
                const res = await fetch(url, newOptions);
                
                abortRef.current = null; 
                
                if (  !res.ok ) // ok is when status >= 200 && <= 299
                {
                    if (res.status >= 500)
                    {
                      throw new Error("The server encountered a temporary error " + 
                      "and could not complete your request. Please reload the page and try again.");
                    }
                    else
                    {
                      let error = await res.json();
                      throw new Error(error.msg); 
                    }
                }
               
                const newData = await res.json(); 
                
                // Order of sets is important here 
                // since react doesn't batch them
                // inside async fns. According to
                // react devs, this is an implementation
                // detail that may change in the future,
                // but it matters for now. 
                setData(newData); 
                setError(null);
                setIsScrolled(false); 
                setIsLoading(false);
                
            }
            catch(e)
            {
                console.error(e);
                
                // We don't actually want to display an
                // error for an aborted request. We just 
                // rather let the newest one go through. 
                if (e instanceof DOMException) 
                {
                    return; 
                }
                
                setError(e); 
                // Could've put the two sets below inside 
                // a finally block if we didn't treat DOMException 
                // differently from normal errors. 
                setIsScrolled(false); 
                setIsLoading(false);
            }
           
        };
      
      fetchData();
      
    }, [url, options]); // Fetch more data when url or options change.
    
    return [{error, isScrolled, isLoading, data}, setUrl, setOptions]; 
    
};

export default useFetchOnScroll;
