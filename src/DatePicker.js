import {useState, useEffect} from "react"

const DatePicker = () => //will use prop fn from above to handle date selecting
{
    // const [fromDate, setFromDate] = useState(""); 
    // const [toDate, setToDate] = useState( setDate() ); str.replace(/\//g, '-');
    const [dateRange, setDateRange] = useState({ fromDate: "", toDate: setTodaysDate() })
    
    const handleSubmit = (e) =>
    {
        e.preventDefault(); 
        //use props fn to pass formatted date string back to main componenet for rerender.
        
    };
    
    const handleChange = (e) =>
    {
        //1. read string length
        //2. format string based on length
        //3. insert / into correct places
        //4. repeat 1-3 until correctly formatted
        //5. display string to user as return value
        console.log(e.target.value); 
        
        const name = e.target.name;
        let value = e.target.value; 
        let isValidDate = true; 
        
        //read length
        //format for slashes / if needed (no slashes? insert them, slashes? leave alone)
        //split at /
        //loop over each passing index to some formatter (so we know if Y or M or D)
        //use Map to see if char allowed at index, if so place there
        //if char not allowed, see if you can replace with 0 (eg MM as 13 will be 10 to be valid so replace 3 with 0)
        
        value = formatSlashes(value);
        
        isValidDate = validateDate(value); 
        
        if (isValidDate)
        {
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

const setTodaysDate = () =>
{
    let todaysDate = new Date().toLocaleDateString("en-US").split("/").map(el => el.length === 1 ? el.padStart(2,0) : el);
    [todaysDate[1], todaysDate[2], todaysDate[0]] = [todaysDate[0], todaysDate[1], todaysDate[2]]; //rearrange in YYYY,MM,DD format
    
    return todaysDate.join("/"); // create string with parts separated by forward slashes YYYY/MM/DD
};

//format slashes for dates (e.g., 2001/09/09)
//by inserting slashes if missing.
//We don't insert slashes if not needed yet 
//(e.g., 1999 not 1999/ but need slash for 1999/1 )
const formatSlashes = (val) => 
{
    val = val.replace(/\s/g, ''); //rip out all spaces
    
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

const validateDate = (val) =>
{
    
    const charsAllowed = new Map(
        [   [0, "1 2"],
            [1, new Map([
                            [1, "9"]
                        ])],
            [2, new Map([
                            [9, "9"]
                        ])],
            [3, new Map([
                            [9, "5"]
                        ])],
            [4, "/"],
            [5, "0 1"],
            [7, "/"],
            [8, "0 1 2 3"]
    ]);
    
    let formattedInput = val.split("");
    
    formattedInput = formattedInput.map((dateChar, i) =>
    {
        let isValidChar = true; 
        isValidChar = charsAllowed.get(i) ? 
                                              ( typeof charsAllowed.get(i) === "string" 
                                              ? charsAllowed.get(i).indexOf(dateChar) !== -1 : charsAllowed.get(i).get( Number( formattedInput[i-1] ) ) ) 
                                          : Number.isInteger(Number(dateChar)); 
        return isValidChar ? dateChar : "E"; //E for error 
    });
    
    //classList.add(error) for each date part that has error
   
    return formattedInput.indexOf("E") === -1; 
    
    
    // const currentChar = val.charAt(val.length - 1); 
    // const isInt = Number.isInteger(val);
    
    // if(!isInt)
    // {
    //     return val.slice(0, val.length -1); 
    // }
    
    // if(val.length > 0 && val.length < 2)
    // {
        
    // }
    
}


export default DatePicker; 