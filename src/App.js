import { useState, useEffect, useRef, useCallback } from 'react';
import {getFormattedDate, modifyDateRange} from "./services/Formatters/dateFormatters";
import Hero from "./components/Hero";
import useFetchOnScroll from "./hooks/useFetchOnScroll"; 
import useIsFirstRender from "./hooks/useIsFirstRender"; 
import ApodList from "./components/ApodList"; 

// Rough outline of the ways that data flows (based on user input) in App:
// 1. set dateRange then set > options (which fetches data) > isLoading > data > 
// error > isScrolled > isLoading > apod
// 2. same as above but isScrolled changes first, then dateRange.
// The above is not 100% accurate depending on situation (e.g., apod
// set directly after data set if sets aren't batched, was the fetch
// successful, etc..), but it helps for visualization purposes.
function App() 
{
    // Get new Date in YYYY/MM/DD format. We use forward slashes 
    // and not hypens. In fact, we replace them on 
    // the client side whenever we might get a date 
    // with a hyphen for two reasons: 
    // 1. We want them displayed like that to the user.
    // 2. When the Date constructor is
    // given a date with a hyphen in the above format
    // (YYYY-MM-DD), it interprets the date as
    // being in UTC format (which may give a date
    // a day behind or ahead of the current date). 
    const todaysDate = getFormattedDate(); 
    
    const [apod, setApod] = useState([]);

    // Set after first data fetch.
    // We're only doing this so our memoized
    // Hero component won't unnecessarily
    // rerender.
    const todaysApodImg = useRef(); 
    
    // We start by just showing today's date. 
    // API makes call by setting a start and end date as a query string on the url,
    // so we have to set a start and end regardless of whether it's 
    // a single day or not. 
    const [dateRange, setDateRange] = useState( 
        { 
            startDate: todaysDate, 
            endDate: todaysDate
        });
    
    // For child DatePicker components.
    // As above for todayApodImg ref, 
    // this is done so Hero can be 
    // memoized. 
    const memoizedSetDateRange = useCallback((dateRange) =>
    {
        setDateRange(dateRange);
    }, [setDateRange]);
    
    const [{isLoading, isScrolled, error, data}, , setOptions] = useFetchOnScroll("/api", [], 
        {
            method: "POST", 
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({startDate: todaysDate, endDate: todaysDate})
        }, 95); //fetch more data when body is 95 percent scrolled

    const isFirstRender = useIsFirstRender(); 
    const modifiedDateRange = useRef(
        {
            startDate: todaysDate, 
            endDate: todaysDate
            
        }); // Ref needed so we can modify dateRange between renders without rerendering
    
    // On dateRange change (i.e., user submits new date),
    // use modifiedDateRange ref to save modified dateRange
    // between renders. Then use new modified dateRange to
    // make call for more apod data. 
    useEffect(() =>
    {
        if (isFirstRender) 
        {
            return; // because the first call to useFetchOnScroll does our first fetch
        }
        
        const newDateRange = modifyDateRange( {...dateRange} );
        
        if ( !newDateRange ) 
        {
            return; // Shouldn't ever happen 
        }
        
        const options = {
            body: JSON.stringify({
              startDate: newDateRange.currentStart,
              endDate: newDateRange.currentEnd
            })
        };
        
        // set new body for POST options, which makes new request to server
        setOptions(prev => ({...prev, ...options}) ); 
        
        // We don't want to update state again, but we do need to save dateRange we're currently
        // using. We save the dateRange and not the newDateRange in case the request we made 
        // above fails (see comment below for second useEffect). 
        modifiedDateRange.current = {...dateRange}; 
        
        if(newDateRange.endDate === newDateRange.currentEnd) // then we're setting a newly entered apod
        {
            setApod([]); // so clear old state
        }
        
    }, [dateRange, setOptions]); // dateRange set by user in some DatePicker
    
    // The currentStart and currentEnd dates below are the
    // same as for the newDateRange that the first useEffect
    // calculated. 
    // Reason we set this here and not in the first useEffect 
    // is in case of a NASA APOD api server error. This way
    // we have a chance to resend for the exact same data (APOD dates)
    // that were missed (this wouldn't get called, so modifiedDateRange 
    // would be same as for last time this was called).
    useEffect(() =>
    {
        // Our first api call is always for today's date.
        // This ensures we only set this once, for the
        // first data that comes back. 
        todaysApodImg.current = todaysApodImg.current ??
            data[0]?.hdurl ?? data[0]?.thumbnail_url ?? data[0]?.url;

        modifiedDateRange.current.currentStart = data[0]?.date.replace(/-/g, "/");
        modifiedDateRange.current.currentEnd = data[data.length - 1]?.date.replace(/-/g, "/"); 
        
        data.reverse(); // because we display dates in descending order. 
        setApod(prev => [...prev, ...data]); 
        
    }, [data]); // when fetch receives data back from server
  
    useEffect(() =>
    {
        // This is the trigger for our infinite scroll technique. 
        // If start and currentStart are the same, we've fetched all the data from current
        // dateRange already. Otherwise, we can trigger 1st useEffect again and the fetch then set cycle repeats. 
        if (isScrolled && !isLoading && 
            modifiedDateRange.current?.startDate !== modifiedDateRange.current?.currentStart)
        {
            setDateRange({...modifiedDateRange.current}); 
            modifiedDateRange.current = null;   
        }

    },[isScrolled, isLoading]);
  
    return (
        <div className="App">
            <Hero heroImgUrl={ todaysApodImg.current }
                dateRange={dateRange} 
                setDateRange={memoizedSetDateRange}
                isLoading={isLoading}
            />
            <section className="card-container">
                {
                    error   
                            ?
                            
                            <div className="error-message"><em>Error!</em>{error.message}</div> 
                        
                            :
                            
                            <ApodList apodList={apod}/>
                            
                }   
            </section>
            {
                isLoading &&
                        <div data-testid="loading" className="card-loader">
                            <div className="spinner"></div>
                            <div className="spinner"></div>
                            <div className="spinner"></div>
                            <div className="spinner"></div>
                        </div> 
            }
        </div>
    );
}

export default App;