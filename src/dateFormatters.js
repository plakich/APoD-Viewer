/*
    @param date {String} - a string representing a date
    fn makes sure date is in correct format for api call (i.e., YYYY/MM/DD )
    fn pads month and day with zeros if needed
*/
export const getFormattedDate = (date) =>
{
    let theDate = date ? new Date(date) : new Date(); //get a date or if none provided get todays
    
    let datePart = theDate.toLocaleDateString("en-US").split("/").map(el => el.length === 1 ? el.padStart(2,0) : el);
    [datePart[1], datePart[2], datePart[0]] = [datePart[0], datePart[1], datePart[2]]; //rearrange in YYYY,MM,DD format
    
    return datePart.join("/"); // create string with parts separated by forward slashes YYYY/MM/DD
};

//@param {String} date - date as String in YYYY/MM/DD format
//format slashes for dates (e.g., 2001/09/09)
//by inserting slashes into correct positions if missing.
//We don't insert slashes if not needed yet 
//(e.g., 199 not 199 / but need slash for 1999/ )
export const formatSlashes = (date) => 
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

//@param {String} date - date as string in YYYY/MM/DD format
//fn returns true if all chars of date (e.g., 1999/09/08)
//are valid (e.g., RARR/BR/tR is not valid) for their respective positions. 
//Does not check if date is actually valid
//(e.g., 1999/09/31 isn't valid since there aren't 31 days
//in September)
export const validateDateChars = (date) =>
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
    
    const errorArray = date.split("").map((dateChar, i, arrValue) =>
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
    @param {String} date - current value of date in YYYY/MM//DD format
    @param {Array of Chars} errorArray - array holding character values for value String signifying positions of errors in date with char E (e.g., 1999/E0/E)
    fn uses errorArray, which is the same length as value, to replace error characters with zeros 
    to make a valid date (e.g., 1999/5/5 becomes 1999/05/05)
*/
export const shiftMonthDayChars = (date, errorArray) =>
{
    const monthStartIndex = 5; 
    
    //make date an array so we can modify 
    //it without changing length (e.g. string "19" -> ['1', '9'] -> ['01', '9'] same length)
    let arrValue = date.split(""); 
    
    if (errorArray.indexOf("E") !== -1 && errorArray.lastIndexOf("E") >= monthStartIndex) //if errors in month and day (MM/DD)
    {
        const maxDateLength = 10; 
        
        for (let i = monthStartIndex; i < errorArray.length; i++) 
        {
            if (errorArray[i] === "E" && Number.isInteger( Number( arrValue[i] ) )) 
            {
                //see if we can insert zeros in error positions to make valid date (e.g. 1999/5/5 -> 1999/05/05
                //or 1999/9999 -> 1999/09/09)
                 arrValue[i] = "0" + arrValue[i]; 
                 date = formatSlashes(arrValue.join("")); //have to reformat slashes because validateChars expects them to be in correct positions
                 
                 //call this again because string could now be correct after insertion of zero and reformatted slashes
                 // (e.g., 1999/50/5 -> 1999/05/05 where 5 as last char would've been an error but now is correct)
                 ({errorArray} = validateDateChars(date)); 
                 
                 //slice value up so string doesn't grow infinitely long, which could happen if error is at the end of 
                 //the string (e.g., 1999/05/00 where the last char is an error)
                 arrValue = date.split("").slice(0, maxDateLength); 
                 
            }
            
        }
        
        date = arrValue.join(""); //reform arr as string
    }

    return date;
    
};

// @param {String} date - a date in format 'YYYY/MM/DD'
// Drops error chars from errorArray (e.g., EYYE/EE/DD)
// returned by validateDateChars fn
export const dropErrorChars = (date) => 
{
    let {errorArray} = validateDateChars(date);
    
    while(errorArray.indexOf("E") !== -1)
    {
        //so we can access and modify string pos i without changing length of string
        date = date.split(""); 
        
        errorArray.forEach((char, i) =>
        {
           if(char === "E")
           {
               date[i] = "";
           }
        });
        date = date.join("");
        date = formatSlashes(date);
        ({errorArray} = validateDateChars(date));
    }
    
    return date; 
};