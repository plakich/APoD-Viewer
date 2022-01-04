/*
    This file contains our collection of date formatters.
    The name date is used loosely, as the dates we manipulate 
    are Strings, not Date objects, though the values often 
    originate from a Date object.
*/


/*
    @param date {String} - a string representing a date
    fn makes sure date is in correct format for api call (i.e., YYYY/MM/DD )
    fn pads month and day with zeros if needed
    (e.g, 2021/8/8 => 2021/08/08). 
*/
export const getFormattedDate = (date) =>
{
    let theDate = date ? new Date(date) : new Date(); //get a date or if none provided get today's
    
    let formattedDate = theDate.toLocaleDateString("en-CA").split("-").join("/"); //rearrange date in YYYY/MM/DD format
    
    return formattedDate; 
};


// may need below fn depending on how NASA APOD API
// handles displaying new APOD in different timezones.
// For instance, if may be the 1st of the month in 
// Australia, but still the 30th in the US. 
// This would result in a bad call to the api 
// if that day wasn't available yet. 

// export const convertTimeZone = (offset) =>
//{
// // create Date object for current location
//     var d = new Date();
//     // convert to msec
//     // add local time zone offset
//     // get UTC time in msec
//     var utc = d.getTime() + (d.getTimezoneOffset() * 60000);

//     // create new Date object for different city
//     // using supplied offset
//     var nd = new Date(utc + (3600000*offset));

//     // return time as a string
//     return "The local time in " + city + " is " + nd.toLocaleString();
//}


/*
    @param {String} date - date as String in YYYY/MM/DD format
    @returns {String} formattedVal - date with slashes formatted correctly
    format slashes for dates (e.g., 2001/09/09)
    by inserting slashes into correct positions if missing.
    We don't insert slashes if not needed yet 
    (e.g., 199 not 199 / but need slash for 1999 -> 1999/ )
*/
export const formatSlashes = (date = "") => 
{
    let formattedVal = date; //assume string correctly formatted, below we format if not
    
    const numOfSlashes = date.match(/\//g) ? date.match(/\//g).length : 0;  
                        
    const slashIndex1 = 4, slashIndex2 = 7; //i.e. for YYYY/MM/DD
                        
    const isCorrectSlashIndex = [ date.indexOf("/") === slashIndex1, date.lastIndexOf("/") === slashIndex2 ]; //e.g. 1999/07/12 slashes supposed to be at index 4 and 7
    
    if (date.length > slashIndex1 - 1 && numOfSlashes === 0) // if string is long enough but no slashes, add one
    {
        formattedVal = date.substring(0, slashIndex1) + "/" +
                        date.substring(slashIndex1, date.length); 
                        
        formattedVal = formatSlashes(formattedVal); //recursive call in case str long enough to need more slashes
    }
    else if (date.length > slashIndex2 - 1 && numOfSlashes === 1 && isCorrectSlashIndex[0]) //if first slash at correct pos, add second if str long enough
    {
        formattedVal = date.substring(0, slashIndex1 + 1 ) +
                        date.substring(slashIndex1 + 1, slashIndex2) +
                        "/" + 
                        date.substring(slashIndex2, date.length); 
    }
    else if ( ( numOfSlashes === 1 && !isCorrectSlashIndex[0] ) || //if has slashes but not in right pos or has more slashes than needed
            ( numOfSlashes === 2 && ( !isCorrectSlashIndex[0] || !isCorrectSlashIndex[1] ) )  ||
            ( numOfSlashes > 2 ) )
    {
        formattedVal = date.replace(/\//g, ''); //rip out slashes and reformat string
        formattedVal = formatSlashes(formattedVal); 
    }
    
    return formattedVal; 
};

/*
    @param {String} date - date (length <= 10) as string in YYYY/MM/DD format
    @returns {Object} - with props isValidDateChars and errorArray
        @returns {Boolean} isValidDateChars - true is chars of date are valid
        @returns {Array} errorArray - date String in array format with error
            chars replaced with letter E (e.g, 1999/99/99 -> 1999/E9/E9 )
    fn returns true (as part of obj) if all chars of date (e.g., 1999/09/08)
    are valid (e.g., RARR/BR/tR is not valid) for their respective positions. 
    Does not check if date is actually valid
    (e.g., 1999/09/31 isn't valid since there aren't 31 days
    in September)
*/
export const validateDateChars = (date = "") =>
{
    const charsAllowed = new Map(
        [   [0, "1 2"],
            [1, new Map([
                            [1, "9"] //if 1 was entered as first char of date, only a 9 is valid as 2nd
                        ])],
            [4, "/"],
            [5, "0 1"],
            [6, new Map([
                            [0, "1 2 3 4 5 6 7 8 9"],
                            [1, "0 1 2"] // October (10), nov (11), and dec (12)
                        ])],
            [7, "/"],
            [8, "0 1 2 3"],
            [9, new Map([
                            [0, "1 2 3 4 5 6 7 8 9"],
                            [3, "0 1"]
                        ])]
    ]);
    
    const errorArray = date.split("").map((dateChar, i, dateCharsArr) =>
    {
        let isValidChar = true; 
        
        // some positions don't have a specific range of chars they map to,
        // in which case as long as said char is an integer it's valid.
        if ( typeof charsAllowed.get(i)?.includes?.(dateChar) !== "undefined" ) // position i in date maps (in charsAllowed map) to a string
        {
            isValidChar = charsAllowed.get(i).includes(dateChar);
        }
        else if ( typeof charsAllowed.get(i)?.get( Number( dateCharsArr[i-1] ) ) !== "undefined" ) // position i in date maps to another map 
        {
            // note we look at previous char entered (i-1) to see if current char
            // is correct or not (e.g., for Month, 03 is fine but 13 is not)
            isValidChar = charsAllowed.get(i).get( Number( dateCharsArr[i-1] ) ).includes(dateChar);
        }
        else // position i in date is undefined in charsAllowed map
        {
            isValidChar = Number.isInteger( Number(dateChar) );
        }
       
        return isValidChar && i < 10 ? dateChar : "E"; //E is for error. Every char that makes string over 10 chars long is invalid since date is YYYY/MM/DD format
    });
   
    return {isValidDateChars: !errorArray.includes("E"), errorArray: errorArray}; 
    
};

/*
    @param {String} date - current value of date in YYYY/MM//DD format
    @param {Array of Chars} errorArray - array holding character values for date 
        String signifying positions of errors in date with char E 
        (e.g., for date 1999/90/9 arrayArray would be 1999/E0/E)
    @returns {String} date - date with chars shifted to new positions if needed
    
    fn uses errorArray, which is the same length as value, to replace error characters with zeros 
    to make a valid date (e.g., 1999/5/5 becomes 1999/05/05)
*/
export const shiftMonthDayChars = (date = "", errorArray = []) =>
{
    const monthStartIndex = 5; 
    
    // Make date an array so we can modify 
    // it without changing length 
    // (e.g. string "19" -> ['1', '9'] -> ['01', '9'] but same length array as string length).
    // We need this below to keep the same position as at in errorArray
    // while potentially changing each char of dateChars
    let dateChars = date.split(""); 
    
    if (errorArray.indexOf("E") !== -1 && errorArray.lastIndexOf("E") >= monthStartIndex) //if errors in month and day (MM/DD)
    {
        const maxDateLength = 10; 
        
        for (let i = monthStartIndex; i < errorArray.length; i++) 
        {
            if (errorArray[i] === "E" && Number.isInteger( Number( dateChars[i] ) )) 
            {
                // see if we can insert zeros in error positions to make valid date (e.g. 1999/5/5 -> 1999/05/05
                // or 1999/9999 -> 1999/09/09)
                dateChars[i] = "0" + dateChars[i]; 
                
                // Increasing str length could make slashes now be in wrong positions. Also
                // have to reformat slashes because validateChars expects them to be in correct positions.
                date = formatSlashes(dateChars.join("")); 
                
                // make another validation call because string could now be correct after insertion of zero and reformatted slashes
                // (e.g., 1999/50/5 -> 1999/05/05 where 5 as last char would've been an error but now is correct)
                ({errorArray} = validateDateChars(date)); 
                
                // slice value up so string doesn't grow infinitely long, which could happen if error is at the end of 
                // the string (e.g., 1999/05/00 where the last char is an error) and we keep adding in zeros
                dateChars = date.split("").slice(0, maxDateLength); 
                 
            }
            
        }
        
        date = dateChars.join(""); 
    }

    return date;
    
};

/*
    @param {String} date - a date in format 'YYYY/MM/DD'
    @param {Array of Chars} errorArray - array holding character 
        values for date String signifying positions of errors in date with char E (e.g., 1999/E0/E) 
    @returns {String} errorMsg - custom errorMsg explaining what position errors are at in date string (i.e., YEAR/MONTH/DAY)
*/
export const customizeInputErrorMsg = (date = "", errorArray = []) =>
{
    let errorMsg = "";
    
    const YEAR = 0;
    const MONTH = 1;
    const DAY = 2; 
    
    // parts are YYYY / MM / DD for both
    const dateErrorParts = errorArray.join("").split("/"); 
    const dateParts = date.split("/"); 
  
    if (dateErrorParts[YEAR] && dateErrorParts[YEAR].indexOf("E") !== -1)
    {
        // using br tags to render newline more easily
        errorMsg = "There was a problem with the YEAR you entered: " + dateParts[YEAR] + "<br/>";
    }
    
    if (dateErrorParts[MONTH] && dateErrorParts[MONTH].indexOf("E") !== -1)
    {
        errorMsg += "There was a problem with the MONTH: " + dateParts[MONTH] + "<br/>"; 
    }
    
    if (dateErrorParts[DAY] && dateErrorParts[DAY].indexOf("E") !== -1)
    {
        errorMsg += "There was a problem with the DAY: " + dateParts[DAY]; 
    }
    
    return errorMsg; 
};

// @param {String} date - a date in format 'YYYY/MM/DD'
// @returns {String} date - date with error chars, if any, removed
// Drops error chars from errorArray (e.g., EYYE/EE/DD)
// returned by validateDateChars fn
export const dropErrorChars = (date = "", errorArray = "") => 
{
    while(errorArray.indexOf("E") !== -1)
    {
        //so we can access and modify string pos i without changing length of string
        date = date.split(""); 
        
        errorArray.forEach((char, i) =>
        {
           if(char === "E")
           {
               date[i] = ""; // replace error char with empty string
           }
        });
        date = date.join("");
        
        // have to re-formatSlashes below since 
        // dropping error chars from string will make
        // slashes be at wrong position in string, if they 
        // were present in original string
        date = formatSlashes(date); 
        
        // and since we reformatted string, we again need
        // to see if there's been any new errors introduced
        // by the formatting
        ({errorArray} = validateDateChars(date));
    }
    
    return date; 
};


 /*
    @param {Object} dateRange - obj with startDate, endDate, currentStart,
    and currentEnd properties. When calling this fn for the first time,
    leave out currentStart and currentEnd properties, which signals to 
    the fn it's a new dateRange being modified for the first time.
    
    On each call, fn subtracts a constant amount of dates from the range
    of dates between start and end dates and sets the currentStart and
    currentEnd properties to those dates. We use this fn before our api
    calls so we only load a set amount of data/dates at once, instead
    of the whole range (because it may be too much at once).
    
    In other words, fn modifies dateRange so the following always holds true:
    
    startDate <= currentStart <= currentEnd <= endDate
    
    @returns {Object} dateObj - obj of strings representing new dateRange,
    always <= 30 days, with currentStart and currentEnd properties
    signifying dateRange between startDate and endDate. 
    Returns null if dateRange cannot be modified anymore (i.e.,
    when currentStart === startDate)
*/
export const modifyDateRange = (dateRange) =>
{
    // Subtract 30 days from current dateRange. 
    // This is so we fetch only 30 apods/days at a time.
    // NASA's APOD api can't handle a request much larger
    // than this without timing out.
    // Could've also made this an argument to the fn
    // if we didn't always want a set amount. 
    const apodFetchMax = 30; 

    // Convert Strings to Dates because we need to perform subtraction
    // on our dates.
    let dateObj = {
        startDate: new Date(dateRange?.startDate),
        endDate: new Date(dateRange?.endDate),
        currentStart: new Date(dateRange?.currentStart || dateRange?.startDate),
        currentEnd: new Date(dateRange?.currentEnd || dateRange?.endDate)
    };
    
    // The currentDate vars are reserved for modifications, 
    // so we shouldn't have one if the date hasn't been modified yet.
    
    const isNewDate = !dateRange?.currentStart;
    
    // Below, we modify the currentStart and currentEnd properties to get more dates between start and end. 
    if ( isNewDate ) 
    {
        // Start at currentEnd because we need to work our way back by set amount
        // from there and currentStart may be further back already than that amount.
        dateObj.currentEnd.setDate(dateObj.currentEnd.getDate() - apodFetchMax); 
        dateObj.currentStart = dateObj.currentEnd;
        dateObj.currentEnd = new Date(dateObj.endDate); 
    }
    else //then we're modifying an existing date and need to fetch apodFetchMax more apods 
    {
        dateObj.currentEnd = dateObj.currentStart; 
        dateObj.currentEnd.setDate(dateObj.currentEnd.getDate() - 1); // Move back one day since we already have that day's apod.
        dateObj.currentStart = new Date(dateObj.currentStart); // so currentStart and currentEnd no longer same reference
        dateObj.currentStart.setDate(dateObj.currentStart.getDate() - apodFetchMax); 
      
    }

    // Now transform dates back into string for api call. 
    // If not this one, then subsequent calls to this fn will
    // eventually make currentStart = startDate (i.e., last possible modification). 
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
      
        // means this is the last modification possible to our dateRange
        dateObj.currentStart = dateObj.startDate; 
    }
    else // for testing completeness, but shouldn't ever make it here in the app 
    {    // else we'd be trying to fetch data outside given dateRange
    
        dateObj = null; // signals no more modifications to dateRange possible
    }
    
    return dateObj; 
};
