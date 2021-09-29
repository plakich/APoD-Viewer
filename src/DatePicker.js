import {useState, useEffect} from "react"

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
                <label htmlFor="fromDate">From Date</label>
                <input type="text"
                    id="fromDate" 
                    name="fromDate" 
                    className="date-picker" 
                    placeholder="YYYY/MM/DD" 
                    value={dateInput.fromDate} 
                    onChange={handleChange}
                    onKeyDown={(e) => setKeyPressed(e.key)}/>
                <label htmlFor="toDate">To Date</label>
                <input type="text" 
                    id="toDate" 
                    name="toDate" 
                    className="date-picker" 
                    placeholder="YYYY/MM/DD" 
                    value={dateInput.toDate} 
                    onChange={handleChange} 
                    onKeyDown={(e) => setKeyPressed(e.key)}/>
                <button type="submit">Submit</button>
            </form>
        </div>
    
    );
};

/*
    @param date {String} - a string representing a date
    fn makes sure date is in correct format for api call (i.e., YYYY/MM/DD )
    fn pads month and day with zeros if needed
*/
const getFormattedDate = (date) =>
{
    let theDate = date ? new Date(date) : new Date(); //get a date or if none provided get todays
    
    let datePart = theDate.toLocaleDateString("en-US").split("/").map(el => el.length === 1 ? el.padStart(2,0) : el);
    [datePart[1], datePart[2], datePart[0]] = [datePart[0], datePart[1], datePart[2]]; //rearrange in YYYY,MM,DD format
    
    return datePart.join("/"); // create string with parts separated by forward slashes YYYY/MM/DD
};

//@param val {String} - a value representing a date in YYYY/MM/DD format
//format slashes for dates (e.g., 2001/09/09)
//by inserting slashes if missing.
//We don't insert slashes if not needed yet 
//(e.g., 199 not 199 / but need slash for 1999/ )
const formatSlashes = (val) => 
{
    let formattedVal = val; //assume string correctly formatted, below we format if not
    
    const numOfSlashes = val.match(/\//g) ? val.match(/\//g).length : 0;  
                        
    const slashIndex1 = 4, slashIndex2 = 7; //i.e. for YYYY/MM/DD
                        
    const isCorrectSlashIndex = [ val.indexOf("/") === slashIndex1, val.lastIndexOf("/") === slashIndex2 ]; //e.g. 1999/07/12 slashes supposed to be at index 4 and 7
    
    if (val.length > slashIndex1 - 1 && numOfSlashes === 0) // if string is long enough but no slashes, add one
    {
        formattedVal = val.substring(0, slashIndex1) + "/" +
                        val.substring(slashIndex1, val.length); 
                        
        formattedVal = formatSlashes(formattedVal); //recursive call in case str long enough to need more slashes
    }
    else if (val.length > slashIndex2 - 1 && numOfSlashes === 1 && isCorrectSlashIndex[0]) //if first slash at correct pos, add second if str long enough
    {
        formattedVal = val.substring(0, slashIndex1 + 1 ) +
                        val.substring(slashIndex1 + 1, slashIndex2) +
                        "/" + 
                        val.substring(slashIndex2, val.length); 
    }
    else if ( ( numOfSlashes === 1 && !isCorrectSlashIndex[0] ) || //if has slashes but not in right pos or has more slashes than needed
            ( numOfSlashes === 2 && ( !isCorrectSlashIndex[0] || !isCorrectSlashIndex[1] ) )  ||
            ( numOfSlashes > 2 ) )
    {
        formattedVal = val.replace(/\//g, ''); //rip out slashes and reformat string
        formattedVal = formatSlashes(formattedVal); 
    }
    
    return formattedVal; 
};

//@param val {String} - val is string representing a date in YYYY/MM/DD format
//fn returns true if all chars of date (e.g., 1999/09/08)
//are valid (e.g., RARR/BR/tR is not valid) for their respective positions. 
//Does not check if date is actually valid
//(e.g., 1999/09/31 isn't valid since there aren't 31 days
//in September)
const validateDateChars = (val) =>
{
    const charsAllowed = new Map(
        [   [0, "1 2"],
            [1, new Map([
                            [1, "9"], //if 1 was entered as first char of date, only a 9 is valid as 2nd
                            [2, "0"]
                        ])],
            [2, new Map([
                            [9, "9"]
                        ])],
            [3, new Map([
                            [9, "5 6 7 8 9"]
                        ])],
            [4, "/"],
            [5, "0 1"],
            [6, new Map([
                            [0, "1 2 3 4 5 6 7 8 9"],
                            [1, "0 1 2"]
                        ])],
            [7, "/"],
            [8, "0 1 2 3"],
            [9, new Map([
                            [0, "1 2 3 4 5 6 7 8 9"],
                            [3, "0 1"]
                        ])]
    ]);
    
    const errorArray = val.split("").map((dateChar, i, arrValue) =>
    {
        let isValidChar = true; 
        
        //some positions don't have a specific range of chars they map to,
        //in which case as long as said char is an integer it's valid.
        isValidChar = charsAllowed.get(i) ? ( typeof charsAllowed.get(i) === "string" 
                                              ? charsAllowed.get(i).indexOf(dateChar) !== -1
                                              : ( charsAllowed.get(i).get( Number( arrValue[i-1] ) ) 
                                                  ? charsAllowed.get(i).get( Number( arrValue[i-1] ) ).indexOf(dateChar) !== -1 
                                                  : Number.isInteger(Number(dateChar)) ) )
                                          : Number.isInteger(Number(dateChar)); 
       
        return isValidChar && i < 10 ? dateChar : "E"; //E is for error. Every char that makes string over 10 chars long is invalid since date is YYYY/MM/DD format
    });
    
    
    //classList.add(error) for each date part that has error
   
    return {isValidDateChars: errorArray.indexOf("E") === -1, errorArray: errorArray}; 
    
};

/*
    @param {String} value - current value of date in YYYY/MM//DD format
    @param {Array of Chars} errorArray - array holding character values for value String signifying positions of errors in date with char E (e.g., 1999/E0/E)
    fn uses errorArray, which is the same length as value, to replace error characters with zeros 
    to make a valid date (e.g., 1999/5/5 becomes 1999/05/05)
*/
const shiftMonthDayChars = (value, errorArray) =>
{
    const monthStartIndex = 5; 
    
    //make value an array so we can modify it without changing length
    let arrValue = value.split(""); 
    
    if (errorArray.indexOf("E") !== -1 && errorArray.lastIndexOf("E") >= monthStartIndex) //look for errors in month and day (MM/DD)
    {
        const maxDateLength = 10; 
        
        for (let i = monthStartIndex; i < errorArray.length; i++) 
        {
            if (errorArray[i] === "E" && Number.isInteger( Number( arrValue[i] ) )) 
            {
                //see if we can insert zeros in error positions to make valid date (e.g. 1999/5/5 -> 1999/05/05
                //or 1999/9999 -> 1999/09/09)
                 arrValue[i] = "0" + arrValue[i]; 
                 value = formatSlashes(arrValue.join("")); //have to reformat slashes because validateChars expects them to be in correct positions
                 
                 //call this again because string could now be correct after insertion of zero and reformatted slashes
                 // (e.g., 1999/50/5 -> 1999/05/05 where 5 as last char would've been an error but now is correct)
                 ({errorArray} = validateDateChars(value)); 
                 
                 //slice value up so string doesn't grow infinitely long, which could happen if error is at the end of 
                 //the string (e.g., 1999/05/00 where the last char is an error)
                 arrValue = value.split("").slice(0, maxDateLength); 
                 
            }
            
        }
        
        value = arrValue.join(""); //reform arr as string
    }

    return value;
    
};

const dropErrorChars = (value) => 
{
    let {errorArray} = validateDateChars(value);
    
    while(errorArray.indexOf("E") !== -1)
    {
        //so we can access and modify string pos i without changing length of string
        value = value.split(""); 
        
        errorArray.forEach((char, i) =>
        {
           if(char === "E")
           {
               value[i] = "";
           }
        });
        value = value.join("");
        value = formatSlashes(value);
        ({errorArray} = validateDateChars(value));
    }
    
    return value; 
};

export default DatePicker; 