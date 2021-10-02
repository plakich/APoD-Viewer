import {useState, useEffect} from "react";
import {getFormattedDate, 
        formatSlashes, 
        validateDateChars, 
        shiftMonthDayChars, 
        dropErrorChars} from "./dateFormatters";

const DatePicker = (props) => 
{
    const {setDateRange} = props; 
    const [dateInput, setDateInput] = useState({ fromDate: "", toDate: getFormattedDate() });
    const [keyPressed, setKeyPressed] = useState("Unidentified");
    
    const handleSubmit = (e) =>
    {
        e.preventDefault(); 
        
        const formattedFrom = dateInput["fromDate"].replace(/\//g, "-");  // need hyphen because api expects - instead of slash /
        const formattedTo = dateInput["toDate"].replace(/\//g, "-");  
        
        const earliestFromDate = "1995/06/16"; //day of first Astronomy Picture of the Day
        
        const latestToDate = getFormattedDate(); //today's date
        
        const isExistsFromDate = dateInput["fromDate"].length > 0; 
        
        const isExistsToDate = dateInput["toDate"].length > 0;
        
        const isValidFromDate =  new Date(dateInput["fromDate"]).toString() !== "Invalid Date";
        
        const isValidToDate =  new Date(dateInput["toDate"]).toString() !== "Invalid Date";
        
        
        const isDateRangeChrononological = new Date(dateInput["fromDate"]) <= new Date(dateInput["toDate"]);
        
        const isFromDateInRange = new Date(dateInput["fromDate"]) >= new Date(earliestFromDate); 
                
        const isToDateInRange = new Date(dateInput["toDate"]) <= new Date(latestToDate);
        
        
        if ( isDateRangeChrononological && isToDateInRange && isFromDateInRange )
        {
            //send off dates to server to make api call
           
            setDateRange({fromDate: formattedFrom, toDate: formattedTo});
        }
        else if ( !isExistsFromDate && isValidToDate && isToDateInRange )  //as long as one date is valid and in range, send to server to get pic for that day
        {
            //send toDate to server to make api call
            setDateRange({fromDate: formattedTo, toDate: formattedTo});

        }
        else if ( !isExistsToDate && isValidFromDate && isFromDateInRange ) //as long as one date is valid and in range, send to server to get pic for that day
        {
            //send fromDate to server to make api call
            setDateRange({fromDate: formattedFrom, toDate: formattedFrom});
           
        }
        else if ( (isValidFromDate && isFromDateInRange) && (isValidToDate && isToDateInRange) && !isDateRangeChrononological )
        {
            //chronology error msg
           
        }
        else if ( ( isValidFromDate && !isValidToDate ) || ( isValidToDate && !isValidFromDate ) )
        {
            
            if ( !isValidFromDate )
            {
                //from date error msg
                
            }
            else if ( !isFromDateInRange ) 
            {
                //from date range error
                
            }
            
            if ( !isValidToDate )
            {
                //to Date error msg
                
            }
            else if ( !isToDateInRange )
            {
                //toDate range error msg
               
            }
            
        }
        else if ( !isValidFromDate && !isValidToDate )
        {
            //error with both dates. 
            
        }
        else if ( ( isValidFromDate && !isFromDateInRange ) || ( isValidToDate && !isToDateInRange ) ) //both valid but contain dateInput errors
        {
            if ( !isFromDateInRange )
            {
                //fromDate range error
               
            }
            
            if ( !isToDateInRange )
            {
                //toDate range error
               
            }
        }
        
    };
    
    //below fn formats string for acceptable YYYY/MM/DD format
    //and sets dateInput if chars valid
    const handleChange = (e) =>
    {
        const maxDateLength = 10; 
        const name = e.target.name;
        
        //replace all whitespace because user could have entered YYYY / MM / DD which is 
        //more than 10 chars (maxDateLength) but that should still be valid. So should
        //YYYY  MM DD (user entered one too many spaces). 
        //We also replace hyphens (-) with a forward slash (/) because when new Date is 
        //given a date with a hyphen, it uses user's local time to set the exact date 
        //which can result in getting a date one day behind or ahead of the day  
        //wanted (relative to GMT). 
        let value = e.target.value.replace(/\s/g, '').replace(/-/g, "/");  
        let isDeleting = keyPressed === "Backspace" || keyPressed === "Delete";  
       
        //string is formatted differently first if user is deleting rather than entering chars
        if (isDeleting) 
        { 
            //setKeyPressed("Unidentified");
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
            
            //value = formatSlashes(value); 
            
            //below, we find which date part strings are shorter than the value last entered for that part (e.g., year/month/day)
            //and reformat the string based on what char of each date part was deleted
            
            if (typeof newDateParts[DAY] !== "undefined" && newDateParts[DAY].length < oldDateParts[DAY].length)
            {
                // e.g., old: 1999/09/01 delete 1 get new: 1999/01/0 but for old: 1999/09/01 new: 1999/09/1 (deleted zero) will be just 1999/09 (day removed altogether)
                value = e.target.selectionEnd === secondDayChar ? newDateParts.join("") : newDateParts[YEAR] + newDateParts[MONTH];
            }
            
            if (typeof newDateParts[MONTH] !== "undefined" && newDateParts[MONTH].length < oldDateParts[MONTH].length) 
            {
                value = e.target.selectionEnd === secondMonthChar ? newDateParts[YEAR] + newDateParts[MONTH] : newDateParts[YEAR];
            }
            
            if (typeof newDateParts[YEAR] !== "undefined" && newDateParts[YEAR].length < oldDateParts[YEAR].length)
            {
                value = newDateParts[YEAR]; 
            }
            
            if (e.target.selectionEnd === slashIndex1 || e.target.selectionEnd === slashIndex2) //a slash was deleted somewhere (e.g., 1999/07/09 -> 199907/09 becomes 1999)
            {
                value = oldValue.slice(0, e.target.selectionEnd); 
            }
            
        }
        
        let isValidDateChars = true; //need date in YYYY/MM/DD format and only certain chars allowed at each index
        let errorArray = []; //so we know which char of YYYY/MM/DD string isn't allowed
        
        value = formatSlashes(value);
        
        value = value.slice(0, maxDateLength); //we don't care about any dates over 10 chars
        
        //insert 'E's into positions where chars aren't allowed in Date (e.g., 19K$ becomes 19EE)
        //so we know which pos error chars are at
        ({isValidDateChars, errorArray} = validateDateChars(value)); 
       
        if (!isValidDateChars) //after this block, date chars will be valid, or string is empty
        {
            //try one more time to 
            //reformat date for month day errors, if any.
            value = shiftMonthDayChars(value, errorArray); //e.g., user entered 1999/9/9 which turns into 1999/09/09
           
            value = dropErrorChars(value);//if date string still has error chars, just drop them from string
           
        }
     
        //If user is deleting last char of date before a slash, just delete the slash for the user too instead
        //of making them delete it manually. For example, for '1999/1' delete the '1' and we should automatically just 
        //get '1999' not '1999/' which is what we would get if entering chars (slash is insertered automatically).
        if (isDeleting) //undo formatted slashes if deleting, if needed
        {
            while (value.lastIndexOf("/") === value.length - 1 && value.length > 0) 
            {
                value = value.slice(0, value.length - 1); 
            }
        }
      
        
        if (value.length === maxDateLength) //a complete date was entered 
        {
            
            //below, getFormattedDate should return the same value as value
            //(e.g., 1999/09/09 should return 1999/09/09). We try to
            //format the date again because of edge cases where the
            //date still wouldn't be correct (e.g., a user who 
            //accidentally entered 1999/09/31 ignoring that they're aren't
            //31 days in September). In that case, the date returned will 
            //be the next valid date (e.g., 1999/10/01); 
            value = getFormattedDate(value); 
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
                        className="date-picker" 
                        placeholder="YYYY/MM/DD" 
                        value={dateInput.fromDate} 
                        onChange={handleChange}
                        onKeyDown={(e) => setKeyPressed(e.key)}/>
                    <label htmlFor="fromDate">From Date <span className="label-small">(YYYY/MM/DD)</span></label>
                </div>
                <div className="input-container">
                    
                    <input type="text" 
                        id="toDate" 
                        name="toDate" 
                        className="date-picker" 
                        placeholder="YYYY/MM/DD" 
                        value={dateInput.toDate} 
                        onChange={handleChange} 
                        onKeyDown={(e) => setKeyPressed(e.key)}/>
                    <label htmlFor="toDate">To Date <span className="label-small">(YYYY/MM/DD)</span></label>
                </div>
                <button type="submit">Submit</button>
                
            </form>
        </div>
    
    );
};

export default DatePicker; 