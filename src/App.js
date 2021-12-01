import { useState, useEffect, useRef } from 'react';
import './App.css';
import {getFormattedDate} from "./dateFormatters";
import Hero from "./Hero";
import useFetchOnScroll from "./useFetchOnScroll"; 
import useIsFirstRender from "./useIsFirstRender"; 
import ApodList from "./ApodList"; 

function App() 
{
  
    const todaysDate = getFormattedDate(); // in YYYY/MM/DD format
    
    const [apod, setApod] = useState([]);
    
    // We start by just showing today's date. 
    // API makes call by setting a start and end date on the url,
    // so we have to set a start and end regardless of whether it's 
    // a single day or not. 
    const [dateRange, setDateRange] = useState( 
      { 
          startDate: todaysDate, 
          endDate: todaysDate, 
          currentStart: todaysDate, 
          currentEnd: todaysDate 
          
      });
    
    const [{isLoading, isScrolled, error, data}, , setOptions] = useFetchOnScroll("/api", [], 
        {
            method: "POST", 
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({startDate: dateRange.currentStart, endDate: dateRange.currentEnd})
        }, 95); //fetch more data when body is 95 percent scrolled
    const isFirstRender = useIsFirstRender(); 
    const modifiedDateRange = useRef(
        {
            startDate: todaysDate, 
            endDate: todaysDate, 
            currentStart: todaysDate, 
            currentEnd: todaysDate
            
        }); // Ref needed so we can modify dateRange between renders without rerendering
    
    /*
        @param dateRange {Object} - obj with startDate, endDate, currentStart,
        and currentEnd properties. 
        On each call, fn subtracts a constant amount of dates from the range
        of dates between start and end dates and sets the currentStart and
        currentEnd properties to those dates. 
        
        In other words, fn modifies dateRange so the following holds true:
        
        startDate <= currentStart <= currentEnd <= endDate
        
        Returns an object of strings representing new dateRange (fn does
        not set new dateRange) or null if dateRange cannot be modified anymore. 
    */
    const modifyDateRange = (dateRange) =>
    {
        // Subtract 30 days from current dateRange. 
        // This is so we fetch only 30 apods/days at a time.
        // NASA's APOD api can't handle a request much larger
        // than this without timing out.
        const apodFetchMax = 30; 
    
        // Obj below will be basis for our dateRange modifications.
        // Ultimately, the dates will be converted back into 
        // a string before returning. 
        let dateObj = {
            startDate: new Date(dateRange.startDate),
            endDate: new Date(dateRange.endDate),
            currentStart: new Date(dateRange.currentStart),
            currentEnd: new Date(dateRange.currentEnd)
        };
        
        // Below, we modify the currentStart and currentEnd properties to get more dates between start and end. 
        if (dateRange.startDate === dateRange.currentStart && dateRange.currentEnd === dateRange.endDate) //then it's a newly entered date
        {
            dateObj.currentEnd.setDate(dateObj.currentEnd.getDate() - apodFetchMax); 
            dateObj.currentStart = dateObj.currentEnd;
            dateObj.currentEnd = new Date(dateRange.currentEnd); 
        }
        else //then we're modifying an existing date and need to fetch apodFetchMax more apods 
        {
            dateObj.currentEnd = dateObj.currentStart; 
            dateObj.currentEnd.setDate(dateObj.currentEnd.getDate() - 1); //move back one day since we already have that day's apod
            dateObj.currentStart = new Date(dateObj.currentStart); 
            dateObj.currentStart.setDate(dateObj.currentStart.getDate() - apodFetchMax); 
          
        }

        // Now transform dates back into string for api call. 
        // If not this one, then subsequent calls to this fn will
        // eventually make currentStart = startDate. 
        // Below cases account for if currentStart was pushed back too
        // far (i.e., when currentStart <= startDate) 
        if (dateObj.currentStart >= dateObj.startDate)
        {
            for (const date in dateObj)
            {
                if (dateObj.hasOwnProperty(date))
                {
                    dateObj[date] = getFormattedDate(dateObj[date]);
                }
            }
          
        }
        else if (dateObj.currentEnd >= dateObj.startDate) 
        {
            for (const date in dateObj)
            {
                if (dateObj.hasOwnProperty(date))
                {
                    dateObj[date] = getFormattedDate(dateObj[date]);
                }
            }
          
            dateObj.currentStart = dateObj.startDate;
        }
        else //for testing completeness, but shouldn't ever make it here else we'd be fetching duplicate data
        {
            dateObj = null; //signals no more modifications to dateRange possible
        }
        
        return dateObj; 
    };
    
    
    // On dateRange change (i.e., user submits new date),
    // use modifiedDateRange ref to save modified dateRange
    // between renders. Then use new modified dateRange to
    // make call for more apod data. 
    useEffect(() =>
    {
        if (isFirstRender) return; // because the first call to useFetchOnScroll does our first fetch
        
        const newDateRange = modifyDateRange(dateRange);
        
        if ( !newDateRange ) return; // Shouldn't ever happen 
        
        const options = {
            body: JSON.stringify({
              startDate: newDateRange.currentStart,
              endDate: newDateRange.currentEnd
            })
        };
        
        // set new body for POST options, which makes new request to server
        setOptions(prev => ({...prev, ...options}) ); 
        
        // We don't want to update state again, but we do need to save dateRange we're currently
        // using. 
        modifiedDateRange.current = {...dateRange}; 
        
        if(newDateRange.endDate === newDateRange.currentEnd) //then we're setting a newly entered apod
        {
            setApod([]); //so clear old state
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
            setDateRange(modifiedDateRange.current); 
            modifiedDateRange.current = null; 
          
        }
    
    },[isScrolled, isLoading]);
  
    return (
        <div className="App">
            <Hero heroImgUrl={ apod[0]?.hdurl ?? apod[0]?.thumbnail_url ?? apod[0]?.url }
                dateRange={dateRange} 
                setDateRange={setDateRange}
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
                        <div className="card-loader">
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