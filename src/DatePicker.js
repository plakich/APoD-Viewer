import {useState, useEffect} from "react"

const DatePicker = () => //will use prop fn from above to handle date selecting
{
    // const [fromDate, setFromDate] = useState(""); 
    // const [toDate, setToDate] = useState( setDate() ); str.replace(/\//g, '-');
    const [dateRange, setDateRange] = useState({ fromDate: null, toDate: setDate() })
    
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
        
    };
    
    
    return (
    
        <div className="container" onSubmit={handleSubmit}>
            <form>
                <label htmlFor="from-date">From Date</label>
                <input type="text" id="from-date" name="from-date" className="date-picker" value={dateRange.fromDate} onChange={handleChange} />
                <label htmlFor="to-date">To Date</label>
                <input type="text" id="to-date" name="to-date" className="date-picker" value={dateRange.toDate} onChange={handleChange} />
                <button type="submit">Submit</button>
            </form>
        </div>
    
    );
};

const setDate = () =>
{
    let todaysDate = new Date().toLocaleDateString("en-US").split("/").map(el => el.length === 1 ? el.padStart(2,0) : el);
    [todaysDate[1], todaysDate[2], todaysDate[0]] = [todaysDate[0], todaysDate[1], todaysDate[2]];
    
    return todaysDate.join("/");
};



export default DatePicker; 