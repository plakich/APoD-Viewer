import {useState, useEffect} from "react"

const DatePicker = () => //will use prop fn from above to handle date selecting
{
    // const [fromDate, setFromDate] = useState(""); 
    // const [toDate, setToDate] = useState( setDate() ); str.replace(/\//g, '-');
    const [dateRange, setDateRange] = useState({ fromDate: "", toDate: getFormattedDate() });
    
    const handleSubmit = (e) =>
    {
        e.preventDefault(); 
        //use props fn to pass formatted date string back to main componenet for rerender.
        
    };
    
    const handleChange = (e) =>
    {
        const maxDateLength = 10; 
        //1. read string length
        //2. format string based on length
        //3. insert / into correct places
        //4. repeat 1-3 until correctly formatted
        //5. display string to user as return value
        console.log(e.target.value); 
        
        const name = e.target.name;
        //replace all whitespace because user could have entered YYYY / MM / DD which is 
        //more than 10 chars (maxDateLength) but that should still be valid. So should
        //YYYY  MM DD (user entered one too many spaces). 
        //We also replace hyphens (-) with a forward slash (/) because when new Date is 
        //given a date with a hyphen, it uses user's local time to set the exact date 
        //which can result in getting a date one day behind or ahead of the day  
        //wanted (relative to GMT). 
        let value = e.target.value.replace(/\s/g, '').replace(/-/g, "/").slice(0, maxDateLength);  
        let isValidDate = true; //need date in YYYY/MM/DD format. 
        let errorArray = []; 
        
        //read length
        //format for slashes / if needed (no slashes? insert them, slashes? leave alone)
        //split at /
        //loop over each passing index to some formatter (so we know if Y or M or D)
        //use Map to see if char allowed at index, if so place there
        //if char not allowed, see if you can replace with 0 (eg MM as 13 will be 10 to be valid so replace 3 with 0)
        
        value = formatSlashes(value);
        
        ({isValidDate, errorArray} = validateDateChars(value)); 
        
        if (!isValidDate) 
        {
            //try one more time to 
            //reformat date for month day errors.
            value = shiftMonthDayChars(value, errorArray);
            ({isValidDate} = validateDateChars(value));
            
        }
        
        if (isValidDate)
        {
            if (value.length === 10) //a complete date was entered 
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
            setDateRange({...dateRange, [name]: value});
        }
        
        
    };
    
    
    return (
    
        <div className="container" onSubmit={handleSubmit}>
            <form>
                <label htmlFor="fromDate">From Date</label>
                <input type="text" id="fromDate" name="fromDate" className="date-picker" placeholder="YYYY/MM/DD" value={dateRange.fromDate} onChange={handleChange} />
                <label htmlFor="toDate">To Date</label>
                <input type="text" id="toDate" name="toDate" className="date-picker" placeholder="YYYY/MM/DD" value={dateRange.toDate} onChange={handleChange} />
                <button type="submit">Submit</button>
            </form>
        </div>
    
    );
};

const getFormattedDate = (date) =>
{
    let theDate = date ? new Date(date) : new Date(); //get a date or if none provided get todays
    
    let datePart = theDate.toLocaleDateString("en-US").split("/").map(el => el.length === 1 ? el.padStart(2,0) : el);
    [datePart[1], datePart[2], datePart[0]] = [datePart[0], datePart[1], datePart[2]]; //rearrange in YYYY,MM,DD format
    
    return datePart.join("/"); // create string with parts separated by forward slashes YYYY/MM/DD
};

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

//fn returns true if all chars of date (e.g., 1999/09/08)
//are valid (e.g., RRRR/RR/RR is not valid). Does not check if date is actually valid
//(e.g., 1999/09/31 isn't valid since there aren't 31 days
//in September)
const validateDateChars = (val) =>
{
    
    const charsAllowed = new Map(
        [   [0, "1 2"],
            [1, new Map([
                            [1, "9"] //if 1 was entered as first char of date, only a 9 is valid as 2nd
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
                            [0, "1 2 3 4 5 6 7 8 9"]
                        ])],
            [7, "/"],
            [8, "0 1 2 3"],
            [9, new Map([
                            [0, '1 2 3 4 5 6 7 8 9'],
                            [3, "0 1"]
                        ])]
    ]);
    
    let formattedInput = val.split("");
    
    formattedInput = formattedInput.map((dateChar, i) =>
    {
        let isValidChar = true; 
        isValidChar = charsAllowed.get(i) ? ( typeof charsAllowed.get(i) === "string" 
                                              ? charsAllowed.get(i).indexOf(dateChar) !== -1
                                              : ( charsAllowed.get(i).get( Number( formattedInput[i-1] ) ) 
                                                  ? charsAllowed.get(i).get( Number( formattedInput[i-1] ) ).indexOf(dateChar) !== -1 
                                                  : Number.isInteger(Number(dateChar)) ) )
                                          : Number.isInteger(Number(dateChar)); 
       
        return isValidChar && i < 10 ? dateChar : "E"; //E is for error. Every char that makes string over 10 chars long is invalid since date is YYYY/MM/DD format
    });
    
    
    //classList.add(error) for each date part that has error
   
    return {isValidDate: formattedInput.indexOf("E") === -1, errorArray: formattedInput}; 
    
};

const shiftMonthDayChars = (value, errorArray) =>
{
    const monthStartIndex = 5; 
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
                 value = formatSlashes(arrValue.join("")); 
                 ({errorArray} = validateDateChars(value));
                 arrValue = value.split("").slice(0, maxDateLength); 
                 
            }
            
        }
        
        value = arrValue.join(""); //reform arr as string
    }

    return value;
    
};

export default DatePicker; 