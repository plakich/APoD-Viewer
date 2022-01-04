import * as dateFormatters from "./dateFormatters";

// each main describe block for each fn in
// dateFormatters
describe("getFormattedDate", () =>
{
    //arrange 
    beforeEach(() =>
    {
        jest.useFakeTimers("modern").setSystemTime(new Date('2021/11/29')); //mock new Date() 
    });
    
    afterEach(() => 
    {
        jest.useRealTimers();
    });

    it("returns today's date when called without actual parameter", () => 
    {
       //act 
       const actual = dateFormatters.getFormattedDate(); 
       const expected = "2021/11/29";
       
       //assert
       expect(actual).toBe(expected);  
    });
    
    it("given a date, returns formatted date of form YYYY/MM/DD", () =>
    {
        const actual = dateFormatters.getFormattedDate("11-01-2021");
        const expected = "2021/11/01";
        
        expect(actual).toBe(expected); 
        
        const monthDayWithoutZeros = dateFormatters.getFormattedDate("8-8-2021");
        const paddedWithZeros = "2021/08/08"; 
        
        expect( monthDayWithoutZeros ).toBe( paddedWithZeros );
    });
    
    it("returns 'Invalid Date' when called with an invalid date", () =>
    {
        expect(dateFormatters.getFormattedDate("badlfjadjf")).toBe("Invalid Date"); 
    });
});

// format slashes for YYYY/MM/DD 
describe("formatSlashes", () =>
{
    it("returns empty string when called without actual parameter", () =>
    {
        const actual = dateFormatters.formatSlashes();
        const expected = ""; 
        
        expect(actual).toBe(expected); 
        
    });
   
    it("returns unmodified string when called with a string.length < 4", () =>
    {
        const actual = dateFormatters.formatSlashes("199");
        const expected = "199"; 
        
        expect(actual).toBe(expected);  
    });
   
    describe("returns string with 1st forward slash in correct position for string.length >= 4 && < 6", () =>
    {
        it("adds a forward slash", () =>
        {
            let actual = dateFormatters.formatSlashes("1999");
            let expected = "1999/";
    
            expect(actual).toBe(expected);
            
            
            actual = dateFormatters.formatSlashes("19991");
            expected = "1999/1";
            
            expect(actual).toBe(expected);
        });
        
        it("already has correct slash positions, so slash positions left as are", () =>
        {
            let actual = dateFormatters.formatSlashes("1999/");
            let expected = "1999/";
            
            expect(actual).toBe(expected);
            
            
            actual = dateFormatters.formatSlashes("1999/0");
            expected = "1999/0";
            
            expect(actual).toBe(expected);
        });
      
      
    });

    describe("returns string with both forward slashes in correct positions for string.length >= 6", () =>
    {
        it("has no slashes so two slashes are added", () =>
        {
            const actual = dateFormatters.formatSlashes("199907");
            const expected = "1999/07/";
            
            expect(actual).toBe(expected);
        });
      
        it("already has one slash, so only one extra added", () => 
        {
            const actual = dateFormatters.formatSlashes("1999/07");
            const expected = "1999/07/";
            
            expect(actual).toBe(expected); 
        });
      
        it("has too many slashes/slashes in wrong positions so slashes are ripped out and inserted into correct positions", () =>
        {
            let actual = dateFormatters.formatSlashes("//199/8////0//7//09/////");
            let expected = "1998/07/09";
            
            expect(actual).toBe(expected);  
            
            
            actual = dateFormatters.formatSlashes("1998/0/709");
            expected = "1998/07/09";
            
            expect(actual).toBe(expected); 
        });
    });
});


describe("validateDateChars (error chars 'E' returned in errorArray are " +
    "defined as chars that are not a number or numbers not allowed in that position)", () =>
{
    it("returns empty array when called without actual parameter or empty string", () =>
    {
        let actual = dateFormatters.validateDateChars("");
        let expected = {errorArray: [], isValidDateChars: true};
        
        expect(actual).toEqual(expected);
        
        
        actual = dateFormatters.validateDateChars();
        expected = {errorArray: [], isValidDateChars: true}; 
        
        expect(actual).toEqual(expected);
    });
    
    it("returns error chars 'E' in errorArray " + 
        "and false for isValidDateChars for errors in YEAR part of date (YYYY/MM/DD)", () =>
    {
        let actual = dateFormatters.validateDateChars("109R");
        let expected = {errorArray: ['1', 'E', '9', 'E'], isValidDateChars: false};
        
        expect(actual).toEqual(expected);
        
        
        actual = dateFormatters.validateDateChars("0199");
        expected = {errorArray: ['E', '1', '9', '9'], isValidDateChars: false};
        
        expect(actual).toEqual(expected);
    });
    
    it("returns error chars 'E' in errorArray " + 
        "and false for isValidDateChars for errors in MONTH part of date (YYYY/MM/DD)", () =>
    {
        let actual = dateFormatters.validateDateChars("2001/2@/");
        let expected = {errorArray: "2001/EE/".split(""), isValidDateChars: false}; 
        
        expect(actual).toEqual(expected); 
        
        
        actual = dateFormatters.validateDateChars("2001/13/");
        expected = {errorArray: "2001/1E/".split(""), isValidDateChars: false};
        
        expect(actual).toEqual(expected);
    });
    
    it("returns error chars 'E' in errorArray " + 
        "and false for isValidDateChars for errors in DAY part of date (YYYY/MM/DD)", () =>
    {
        let actual = dateFormatters.validateDateChars("2001/12/4*");
        let expected = {errorArray: "2001/12/EE".split(""), isValidDateChars: false};
        
        expect(actual).toEqual(expected); 
        
        
        actual = dateFormatters.validateDateChars("2001/12/32");
        expected = {errorArray: "2001/12/3E".split(""), isValidDateChars: false}
        
        expect(actual).toEqual(expected); 
    });
    
    it("returns error chars 'E' in errorArray " +
        "and false for isValidDateChars for errors in SLASHES part of date (YYYY/MM/DD)", () =>
    {
        const actual = dateFormatters.validateDateChars("200/11/242");
        const expected =  {errorArray: "200EE1EEE2".split(""), isValidDateChars: false};
        
        expect(actual).toEqual(expected); 
    });
    
    it("returns errorArray without error chars 'E' and isValidDateChars is true for valid dates, testing " +
        "all possible tens place values for month and day", () =>
    {
        let actual = dateFormatters.validateDateChars("1995/08/31");
        let expected = {errorArray: "1995/08/31".split(""), isValidDateChars: true};
        
        expect(actual).toEqual(expected);
        
        
        actual = dateFormatters.validateDateChars("2010/01/29");
        expected = {errorArray: "2010/01/29".split(""), isValidDateChars: true};
        
        expect(actual).toEqual(expected);
        
        
        actual = dateFormatters.validateDateChars("2021/10/10");
        expected = {errorArray: "2021/10/10".split(""), isValidDateChars: true};
        
        expect(actual).toEqual(expected);
        
        
        actual = dateFormatters.validateDateChars("2000/05/01");
        expected =  {errorArray: "2000/05/01".split(""), isValidDateChars: true};
        
        expect(actual).toEqual(expected);
    });
    
    it("returns ", () => //using this for function testing below to confirm errorArray values (erase when done)
    {
        expect(dateFormatters.validateDateChars("1999/50/5")).toEqual( {errorArray: "1999/E0/E".split(""), isValidDateChars: false}) 
    });
});

describe("shiftMonthDayChars (error chars 'E' are numbers at wrong position in date, " +
    "or chars that aren't a number)", () =>
{
    let errorArray = []; 
    
    it("returns empty string when called with no actual parameter or emtpy string", () =>
    {
        let actual = dateFormatters.shiftMonthDayChars();
        let expected = ""; 
        
        expect(actual).toBe(expected); 
        
        
        actual = dateFormatters.shiftMonthDayChars("");
        expected = ""; 
        
        expect(actual).toBe(expected); 
    });
    
    it("returns string unmodified for dates with no errors", () =>
    {
        errorArray = "2012/11/21".split("");
        
        const actual = dateFormatters.shiftMonthDayChars("2012/11/21", errorArray);
        const expected = "2012/11/21";
        
        expect(actual).toBe(expected);   
    });
    
    it("shifts error chars one index to right and pads error positions with a zero (checking for month and day errors)", () =>
    {
        errorArray = "1999/E9/".split("");
        
        let actual = dateFormatters.shiftMonthDayChars("1999/99/", errorArray);
        let expected = "1999/09/09";
        
        expect(actual).toBe(expected);
        
        
        errorArray = "1999/E0/E".split(""); 
        
        actual = dateFormatters.shiftMonthDayChars("1999/50/5", errorArray);
        expected = "1999/05/05";
        
        expect(actual).toBe(expected);  
    });
    
    it("doesn't shift in zeros indefinitely for errors at end of string", () =>
    {
        errorArray = "1997/08/0E".split("");
        
        const actual = dateFormatters.shiftMonthDayChars("1997/08/00", errorArray);
        const expected = "1997/08/00";
        
        expect(actual).toBe(expected);  
    });
});


describe("dropErrorChars (error chars 'E' are numbers at wrong position in date, " +
    "or chars that aren't a number)", () =>
{
    let errorArray = []; 
    
    it("returns empty string when called with no actual parameter or empty string", () =>
    {
        let actual = dateFormatters.dropErrorChars();
        let expected = "";
        
        expect(actual).toBe(expected);  
        
        
        actual = dateFormatters.dropErrorChars("");
        expected = ""; 
        
        expect(actual).toBe(expected);
    });
    
    it("returns unmodified string for string without errors", () =>
    {
        errorArray = "1995/08/08".split(""); 
        
        const actual = dateFormatters.dropErrorChars("1995/08/08", errorArray);
        const expected = "1995/08/08";
        
        expect(actual).toBe(expected);
    });
    
    describe("returns string with all error chars dropped from string", () =>
    {
        it("returns string with errors dropped from YEAR part of string", () =>
        {
            errorArray = "199E/01/01".split("");
            
            const actual = dateFormatters.dropErrorChars("199$/01/01", errorArray);
            const expected = "1990/10/1";
            
            expect(actual).toBe(expected);
        });
        
        
        it("returns string with errors dropped from MONTH part of string (all combinations tested)", () =>
        {
            errorArray = "1995/E1/03".split(""); 
            
            let actual = dateFormatters.dropErrorChars("1995/41/03", errorArray);
            let expected = "1995/10/3";
            
            expect(actual).toBe(expected);
            
            
            errorArray = "1995/1E/01".split("");
            
            actual = dateFormatters.dropErrorChars("1995/15/01", errorArray);
            expected = "1995/10/1";
            
            expect(actual).toBe(expected);
            
            
            errorArray = "1995/EE/01".split("");
            
            actual = dateFormatters.dropErrorChars("1995/55/01", errorArray);
            expected = "1995/01/";
            
            expect(actual).toBe(expected);
        });
        
        it("returns string with errors dropped from DAY part of string (all error combinations tested)", () =>
        {
            errorArray = "1997/08/3E".split("");
            
            let actual = dateFormatters.dropErrorChars("1997/08/35", errorArray);
            let expected = "1997/08/3";
            
            expect(actual).toBe(expected);
            
            
            errorArray = "1997/08/E1".split("");
            
            actual = dateFormatters.dropErrorChars("1997/08/41", errorArray);
            expected = "1997/08/1";
            
            expect(actual).toBe(expected);
            
            
            errorArray = "1997/08/EE".split(""); 
            
            actual = dateFormatters.dropErrorChars("1997/08/44", errorArray);
            expected = "1997/08/"; 
            
            expect(actual).toBe(expected);
        });
        
        // Technically, the tests below are unnecessary, since we've already proved above
        // that errors in each part of the date are correctly dropped.
        describe("when fn drops chars, the new chars that were shifted left will also be dropped if they " +
            "become error chars", () =>
        {
            
            it("drops the first char from DAY portion of string resulting in second DAY char also being dropped", () =>
            {
                errorArray = "1999/10/E5".split("");
                
                // 1999/10/45 -> 1999/10/5 -> 1999/10/
                const actual = dateFormatters.dropErrorChars("1999/10/45", errorArray);
                const expected = "1999/10/"; 
                
                expect(actual).toBe(expected);
                
            });
            
            it("drops chars from MONTH portion of string resulting in more chars being dropped (all MONTH error combinations tested)", () =>
            {
                errorArray = "1999/1E/31".split("");
                
                // 1999/13/31 -> 1999/13/1 -> 1999/11/
                let actual = dateFormatters.dropErrorChars("1999/13/31", errorArray);
                let expected = "1999/11/"; 
                
                expect(actual).toBe(expected);
                
                
                errorArray = "1999/E2/31".split("");
                
                // 1999/22/31 -> 1999/23/1 -> 1999/31/ -> 1999/1
                actual = dateFormatters.dropErrorChars("1999/22/31", errorArray);
                expected = "1999/1"; 
                
                expect(actual).toBe(expected);
                
                
                errorArray = "1999/EE/32".split("");
                
                // 1999/2N/32 -> 1999/32/ -> 1999/2 -> 1999/
                actual = dateFormatters.dropErrorChars("1999/2N/32", errorArray);
                expected = "1999/"; 
                
                expect(actual).toBe(expected);
                
            });
            
            it("drops all chars from YEAR portion of string resulting in all chars being dropped", () =>
            {
                errorArray = "EEEE/09/30".split(""); 
                
                // EEEE/09/30 -> E930/ -> E30 -> E0 -> E -> ""
                const actual = dateFormatters.dropErrorChars("9999/09/30", errorArray);
                const expected = "";
                
                expect(actual).toBe(expected);
            });
        });
        
    });
    
    
});


describe("customizeInputErrorMsg  (error chars 'E' are numbers at wrong position in date, " +
    "or chars that aren't a number)", () =>
{
    
    let errorArray = [];
    
    it("returns empty string when called without an actual parameter or called with an empty string", () => 
    {
        let actual = dateFormatters.customizeInputErrorMsg();
        let expected = "";
        
        expect(actual).toBe(expected);
        
        
        actual = dateFormatters.customizeInputErrorMsg("");
        expected = "";
        
        expect(actual).toBe(expected); 
    });
    
    it("returns empty string/no error message for date strings without errors", () =>
    {
        errorArray = "2001/01/20".split(""); 
        
        const actual = dateFormatters.customizeInputErrorMsg("2001/01/20", errorArray);
        const expected = "";
        
        expect(actual).toBe(expected); 
    });
    
    it("returns error message containing string YEAR for date with error in YEAR part of date", () =>
    {
        errorArray = "1E01/01/20".split(""); 
        
        const actual = dateFormatters.customizeInputErrorMsg("1801/01/20", errorArray);
        const expected = "YEAR";
        
        expect(actual).toContain(expected);            
    });
    
    it("returns error message containing string MONTH for date with error in MONTH part of date", () =>
    {
        errorArray = "2010/1E/20".split(""); 
        
        const actual = dateFormatters.customizeInputErrorMsg("2010/13/20", errorArray);
        const expected = "MONTH";
        
        expect(actual).toContain(expected);            
    });
    
    it("returns error message containing string DAY for date with error in DAY part of date", () =>
    {
        errorArray = "2010/12/3E".split(""); 
        
        const actual = dateFormatters.customizeInputErrorMsg("2010/12/33", errorArray);
        const expected = "DAY";
        
        expect(actual).toContain(expected);            
    });
    
    it("returns error message containing string DAY, MONTH, YEAR for date with error in " +
        "all parts of date", () =>
    {
        errorArray = "1E10/1E/3E".split(""); 
        
        const actual = dateFormatters.customizeInputErrorMsg("1810/13/32", errorArray);
        
        // Look for YEAR MONTH DAY in a string. Using positive lookahead (?=), search string
        // for YEAR (whole word), matching any number of chars ([\s\S]*) as it needs to before
        // reaching YEAR. Reset position, and continue with search for MONTH, etc. The 
        // unlimited match char class at end will match the whole paragraph after finding the words. 
        // Using char class [\s\S]* as .* doesn't match newlines. 
        const expected = /(?=[\s\S]*\bYEAR\b)(?=[\s\S]*\bMONTH\b)(?=[\s\S]*\bDAY\b)[\s\S]*/
        
        expect(actual).toMatch(expected);       
    });
        
});

describe("modifyDateRange", () =>
{
    it("returns null when given no date, already fully modified date (currentStart === startDate), " +
        "or dateRange with errors (i.e, non chronological or invalid dates)", () =>
    {
        let dateRange = {
                startDate: "2021/11/10",
                endDate: "2021/10/10"
            };
        
        let actual = dateFormatters.modifyDateRange(dateRange); // dateRange not chronological 
        
        expect(actual).toEqual(null); 
        
        dateRange.startDate = new Date('alkdfjij').toString() // invalid date;
        
        actual = dateFormatters.modifyDateRange(dateRange);
        
        expect(actual).toEqual(null); 
        
        dateRange = {
                startDate: "2021/10/10",
                endDate: "2021/11/10",
                currentStart: "2021/10/10",
                currentEnd: "2021/10/10"
            }; // currentStart === startDate
        
        actual = dateFormatters.modifyDateRange(dateRange); //no more modification possible on this dateRange
        
        expect(actual).toEqual(null); 
        
        actual = dateFormatters.modifyDateRange(); // no dateRange given
        
        expect(actual).toEqual(null); 
    });
    
    describe("fn always returns <= 30 days at a time, " +
        "in the form of currentStart and currentEnd properties, " +
        "such that the following always holds true: " + 
        "startDate <= currentStart <= currentEnd <= endDate", () =>
    {
        // edge cases first
        test("dateRange of 1 day", () =>
        {
            const dateRange = {
                    startDate: "2021/11/10",
                    endDate: "2021/11/10"
                };
            
            const actual = dateFormatters.modifyDateRange(dateRange);
            
            // modifyDateRange will add currentStart and end dates
            dateRange.currentStart = "2021/11/10";
            dateRange.currentEnd = "2021/11/10"; 
            
            expect(actual).toEqual(dateRange); 
        });
        
        test("dateRange of 30 days", () =>
        {
            let dateRange =  {
                    startDate: "2021/11/10",
                    endDate: "2021/12/10",
                    currentStart: "",
                    currentEnd: ""
                }; // 30 days
                
            let actual = dateFormatters.modifyDateRange(dateRange);
            
            dateRange.currentStart = "2021/11/10";
            dateRange.currentEnd = "2021/12/10"; 
                
            expect(actual).toEqual(dateRange); 
            
        });
        
        // We only need one test here to show the fn works, 
        // as this runs through all the logic and cases. 
        // The above tests were just to ensure edge cases
        // worked correctly. 
        test("dateRange of 31 days", () =>
        {
            let dateRange =  {
                startDate: "2021/11/09",
                endDate: "2021/12/10"
            }; // 31 days
        
            let actual = dateFormatters.modifyDateRange(dateRange);
            
            dateRange.currentStart = "2021/11/10"; // = 2021/12/10 - 30 days
            dateRange.currentEnd = "2021/12/10"; 
            
            expect(actual).toEqual(dateRange);   
            
            // Call it one more time, anymore would return null again as in
            // above tests.
            actual = dateFormatters.modifyDateRange(dateRange); 
            
            // 1 more day/the rest of the original dateRange
            dateRange.currentStart = "2021/11/09"; 
            dateRange.currentEnd = "2021/11/09"; 
            
            expect(actual).toEqual(dateRange); 
                    
        });
    });
})