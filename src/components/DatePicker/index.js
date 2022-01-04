import {useState, useEffect} from "react";
import {getFormattedDate, 
        formatSlashes, 
        validateDateChars, 
        shiftMonthDayChars,
        customizeInputErrorMsg,
        dropErrorChars} from "../../services/Formatters/dateFormatters";

const DatePicker = (props) => 
{
    const {dateRange, setDateRange, isLoading} = props; 
    const [dateInput, setDateInput] = useState(
        { 
            // only display one date if both are equal
            // so as not to seem like user is choosing
            // an actual range
            fromDate: dateRange.startDate === dateRange.endDate ? "" : dateRange.startDate, 
            toDate: dateRange.endDate 
        });
    const [keyPressed, setKeyPressed] = useState("Unidentified"); // so we can keep track of delete and backspaces
    const [isError, setIsError] = useState({fromDateError: false, toDateError: false, fromDateMsg: "", toDateMsg: ""}); // to show error msgs under inputs
    const [isBtnDisabled, setIsBtnDisabled] = useState(false); 
    
    // show input errors, but clear after 6 seconds
    useEffect(() =>
    {
        let id = setTimeout(() =>
        {
            if (isError.fromDateError || isError.toDateError)
            {
                setIsError({fromDateError: false, toDateError: false, fromDateMsg: "", toDateMsg: ""});
            }
            
        }, 6000);
        
        return () => clearTimeout(id);
        
    }, [isError]);
    
    // If user sets new dateRange from different
    // datePicker component, then we need to reflect 
    // the change of date in this datePicker component as well. 
    useEffect(() => 
    {
        setDateInput(
        {
            fromDate: dateRange.startDate === dateRange.endDate ? "" : dateRange.startDate, 
            toDate: dateRange.endDate
         
        });
        
    }, [dateRange]);
    
    useEffect(() =>
    {
        /*
            We disable btn on submit/load
            since we want to give the user
            some feedback that the request 
            was sent. Note: this doesn't
            stop the user from sending
            multiple requests at once
            since they still have access
            to other datePicker components
            that can be conditionally rendered. 
            That condition is handled via a 
            custom fetch hook. 
        */
        if (!isLoading)
        {
            
            setIsBtnDisabled(false); 
        }
        
    }, [isLoading]);
    
    useEffect(() =>
    {
        /*
            Our handleSubmit fn sets
            btn to disabled initially,
            but it also can set errors too,
            so we want to clear the btn disabled
            status on error so the user can try again right
            away. 
        */
        if ( isError.toDateError || isError.fromDateError )
        {
            setIsBtnDisabled(false); 
        }
        
    }, [isError]);
    
    // btn is first disabled when 
    // user enters a new date.
    // This is so the user knows 
    // there's more content loading 
    // below the fold. 
    useEffect(() => 
    {
        if (isBtnDisabled)
        {
            const formContainer = document.querySelector(".hero__title + .form-container");
            formContainer?.classList.add("loaded"); //so down arrow animation plays 
        }
        
    }, [isBtnDisabled]);
    
    /* 
        fn validates form data in different ways
        (e.g., does the date exist, is it valid, etc)
        and uses the results to either set a new dateRange
        or show error messages. 
    */
    const handleSubmit = (e) =>
    {
        e.preventDefault(); 
        
        /*
            set btn disabled, not to stop a user from 
            submitting multiple identical requests 
            (the app handles such a situation and aborts 
            all but the most recent anyway) but to give
            some visual indication to the user that the 
            request was submitted. 
        */
        setIsBtnDisabled(true); 
        
        // dates (in String representation) are fully formatted 
        // (in format apod api accepts) at this point
        const formattedFrom = dateInput.fromDate; 
        const formattedTo = dateInput.toDate; 
        
        const validDateLength = 10;
        
        const earliestFromDate = "1995/06/16"; // day of first Astronomy Picture of the Day
        
        const todaysDate = getFormattedDate(); // latest toDate
        
        /*
            Technically, nonexistent dates are also invalid dates. 
            Invalidity can mean many other things though (see our cases below).  
            So we still need these two variables below for the two cases
            when we're setting a new dateRange with only one input filled
            and the other empty ( !isExists ). A simple check for !isValidDate
            would wrongfully send dates that exist but are problematic in some
            way. 
        */
        const isExistsFromDate = formattedFrom.length > 0; 
        
        const isExistsToDate = formattedTo.length > 0;
        
        const isValidFromDate =  formattedFrom.length === validDateLength 
            && new Date(formattedFrom).toString() !== "Invalid Date";
        
        const isValidToDate =  formattedTo.length === validDateLength
            && new Date(formattedTo).toString() !== "Invalid Date";
        
        
        const isDateRangeChrononological = new Date(formattedFrom) <= new Date(formattedTo);
        
        const isFromDateInRange = new Date(formattedFrom) >= new Date(earliestFromDate)
            && new Date(formattedFrom) <= new Date(todaysDate); 
                
        const isToDateInRange = new Date(formattedTo) <= new Date(todaysDate)
            && new Date(formattedTo) >= new Date(earliestFromDate);
        
        
        if ( (isValidFromDate && isValidToDate) && (isFromDateInRange && isToDateInRange) && isDateRangeChrononological )
        {
            // send off dates to server to make api call
            setDateRange({startDate: formattedFrom, endDate: formattedTo}); 
        }
        else if ( !isExistsFromDate && isValidToDate && isToDateInRange )  //as long as one date is valid and in range, send to server to get pic for that day
        {
            // send toDate to server to make api call
            setDateRange({startDate: formattedTo, endDate: formattedTo}); 

        }
        else if ( !isExistsToDate && isValidFromDate && isFromDateInRange ) //as long as one date is valid and in range, send to server to get pic for that day
        {
            // send fromDate to server to make api call
            setDateRange({startDate: formattedFrom, endDate: formattedFrom}); 
           
        }
        else if ( (isValidFromDate && isFromDateInRange) && (isValidToDate && isToDateInRange) && !isDateRangeChrononological )
        {
            setIsError({...isError, fromDateError: true, fromDateMsg: "Start Date must come before End Date!"});
           
        }
        else if ( !isValidFromDate || !isValidToDate ) // either from date or to date is invalid or both
        {
            // have to also account for case when one date is invalid and other is out of range
            // so we can show both errors at same time 
            if ( !isValidFromDate )
            {
                setIsError({...isError, fromDateError: true, fromDateMsg: "Start Date is NOT a valid date!"});
                
            }
            else if ( !isFromDateInRange ) 
            {
                setIsError({...isError, fromDateError: true, fromDateMsg: 
                `Start Date must be no earlier than the day of the first APOD ${earliestFromDate} 
                or later than today's date ${todaysDate}`});
                
            }
            
            if ( !isValidToDate )
            {
                setIsError( state => ({...state, toDateError: true, toDateMsg: "End Date is NOT a valid date!"}));
                
            }
            else if ( !isToDateInRange )
            {
                setIsError(state => ({...state, toDateError: true, toDateMsg: 
                 `End date must be no later than today's date ${todaysDate} or 
                 earlier than the day of the first APOD ${earliestFromDate}`}));
            }
            
        }
        else if ( ( isValidFromDate && !isFromDateInRange ) || ( isValidToDate && !isToDateInRange ) ) //both dates valid but not in range
        {
            if ( !isFromDateInRange )
            {
                setIsError({...isError, fromDateError: true, fromDateMsg: 
                 `Start Date must be no earlier than the day of the first APOD ${earliestFromDate} 
                 or later than today's date ${todaysDate}`});
            }
            
            if ( !isToDateInRange )
            {
                //need state => ...state because we could be setting state in first if 
                //hence both run in same cycle/context and ...isError would still be old state
                setIsError(state => ({...state, toDateError: true, toDateMsg: 
                 `End date must be no later than today's date ${todaysDate} or 
                 earlier than the day of the first APOD ${earliestFromDate}`}));
            }
        }
        
    };
    
   /* 
        fn below formats string (from input) for acceptable YYYY/MM/DD format
        and sets dateInput if chars valid. Fn essentially acts as an input
        mask for correct date formats (ones APOD api will accept). 
        Much of the work the fn does is because we have to account 
        for the fact that people could be copy/pasting dates and not
        just entering one char at a time in the input. 
    */
    const handleChange = (e) =>
    {
        const maxDateLength = 10; 
        const name = e.target.name; // either fromDate or toDate 
        
        /*
            Replace all whitespace because, for example, user could have entered YYYY / MM / DD which is 
            more than 10 chars (maxDateLength) but that should still be valid. So should
            YYYY  MM DD (user entered one too many spaces). 
            We also replace hyphens (-) with a forward slash (/) because when Date constructor is 
            given a date with a hyphen, the date is parsed in UTC which can
            result in getting a date one day behind or ahead of the day we
            wanted (relative to GMT). 
        */
        let value = e.target.value.replace(/\s/g, '').replace(/-/g, "/");  
        let isDeleting = keyPressed === "Backspace" || keyPressed === "Delete";  
       
        /*
            String is formatted differently first if user is deleting rather than entering chars,
            and so we may end up deleting more chars than what the user deleted. For example, for
            1999/07/02 if we delete the 7 we'd want the string to just show 1999/0 not 1999/0/02
            since we interpret that as the user trying to delete that whole part of the string. 
            
        */
        if (isDeleting) 
        { 
            const oldValue = dateInput[name];
            
            const YEAR = 0;
            const MONTH = 1;
            const DAY = 2; 
            const slashIndex1 = 4;
            const slashIndex2 = 7; 
            const secondDayChar = 9; 
            const secondMonthChar = 6; 
            
            const oldDateParts = oldValue.split("/"); // for 'YYYY/MM/DD' date we get -> [YYYY, MM, DD] 
            const newDateParts = value.split("/");
            
            // Below, we want to delete the character the user deleted (pos at selectionEnd) and all the chars that come 
            // after as well (e.g., 1997/08 delete the 7 and we get just 199), which is why we have to consider
            // each part of the date (year, month, and day). There's a case for slashes too, even though it's 
            // not a datePart. 
            
            if (typeof newDateParts[DAY] !== "undefined" && newDateParts[DAY].length < oldDateParts[DAY].length) // if part of day was deleted
            {
                // e.g., old: 1999/09/01 delete 1 at end get new: 1999/01/0 but 
                // for old: 1999/09/01 and new: 1999/09/1 (deleted zero) will be just 1999/09 (day removed altogether)
                value = e.target.selectionEnd === secondDayChar ? newDateParts.join("/") : newDateParts[YEAR] + "/" + newDateParts[MONTH];
            }
            
            if (typeof newDateParts[MONTH] !== "undefined" && newDateParts[MONTH].length < oldDateParts[MONTH].length) 
            {
                value = e.target.selectionEnd === secondMonthChar ? newDateParts[YEAR] + "/" + newDateParts[MONTH] : newDateParts[YEAR];
            }
            
            if (typeof newDateParts[YEAR] !== "undefined" && newDateParts[YEAR].length < oldDateParts[YEAR].length)
            {
                value = newDateParts[YEAR].slice(0, e.target.selectionEnd); 
            }
            
            if (e.target.selectionEnd === slashIndex1 || e.target.selectionEnd === slashIndex2) // a slash was deleted somewhere (e.g., 1999/07/09 -> 199907/09 becomes 1999)
            {
                value = oldValue.slice(0, e.target.selectionEnd); 
            }
            
        }
        else // user entering chars
        {
            
           
            value = formatSlashes(value); // so slashes are in correct positions for YYYY/MM/DD format
            value = value.slice(0, maxDateLength); // we don't care about any dates over 10 chars
            
            let isValidDateChars = true; // need date in YYYY/MM/DD format and only certain chars allowed at each index
            let errorArray = []; // so we know which char of YYYY/MM/DD string isn't allowed
          
            // insert 'E's into positions where chars aren't allowed in Date (e.g., 19K$ becomes 19EE)
            // so we know which pos error chars are at
            ({isValidDateChars, errorArray} = validateDateChars(value)); 
           
            if ( !isValidDateChars ) // after this block, date chars will be valid, or string is empty
            {
                // Try one more time to 
                // reformat date for month day errors, if any.
                value = shiftMonthDayChars(value, errorArray); //e.g., user entered 1999/9/9 which turns into 1999/09/09
               
                ({isValidDateChars, errorArray} = validateDateChars(value));
                
                if ( !isValidDateChars ) // then tell the user where the error is in date
                {
                    setIsError({...isError, [name + "Error"]: true, [name + "Msg"]: customizeInputErrorMsg(value, errorArray) });
                }
                
                value = dropErrorChars(value, errorArray); // if date string still has error chars, just drop them from string
               
            }
            
            if (value.length === maxDateLength) // a complete date was entered 
            {
                
                /*
                    Below, getFormattedDate should return the same value as value
                    (e.g., 1999/09/09 should return 1999/09/09). We try to
                    format the date again because of edge cases where the
                    date still wouldn't be correct (e.g., a user who 
                    accidentally entered 1999/09/31 ignoring that there aren't
                    31 days in September). In that case, the date returned will 
                    be the next valid date (e.g., 1999/10/01); 
                */
                value = getFormattedDate(value); 
            }
        
        }
   
        setDateInput({...dateInput, [name]: value});
        
    };
    
    return (
    
        <div className="form-container">
            <form onSubmit={handleSubmit}>
                <div className="input-container">
                    
                    <input type="text"
                        id="fromDate" 
                        name="fromDate" 
                        className={"date-picker" + (isError.fromDateError ? " date-error" : "")}
                        placeholder="YYYY/MM/DD" 
                        value={dateInput.fromDate} 
                        onChange={handleChange}
                        onKeyDown={(e) => setKeyPressed(e.key)}/>
                    <label htmlFor="fromDate">Start Date <span className="label-small">(YYYY/MM/DD)</span></label>
                    {
                        
                        isError.fromDateError && <p className="date-error-msg">{isError.fromDateMsg.split("<br/>").join("\n")}</p> 
                    }
                </div>
                <div className="input-container">
                    
                    <input type="text" 
                        id="toDate" 
                        name="toDate" 
                        className={"date-picker" + (isError.toDateError ? " date-error" : "")} 
                        placeholder="YYYY/MM/DD" 
                        value={dateInput.toDate} 
                        onChange={handleChange} 
                        onKeyDown={(e) => setKeyPressed(e.key)}/>
                    <label htmlFor="toDate">End Date <span className="label-small">(YYYY/MM/DD)</span></label>
                    {
                        
                        isError.toDateError && <p className="date-error-msg">{isError.toDateMsg.split("<br/>").join("\n")}</p> 
                    }
                </div>
                <button type="submit" disabled={isBtnDisabled}>Submit</button>
                
            </form>
        </div>
    
    );
};

export default DatePicker; 

