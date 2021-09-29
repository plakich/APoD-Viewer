import { useState, useEffect } from 'react';
import './App.css';
import ApodCard from "./ApodCard"; 
import DatePicker from "./DatePicker"; 


function App() {
  
  let todaysDate = new Date(); // get today's date
    
  let datePart = todaysDate.toLocaleDateString("en-US").split("/").map(el => el.length === 1 ? el.padStart(2,0) : el);
  [datePart[1], datePart[2], datePart[0]] = [datePart[0], datePart[1], datePart[2]]; //rearrange in YYYY,MM,DD format
    
  todaysDate = datePart.join("-"); // create string with parts separated by forward slashes YYYY/MM/DD
  
  const [apod, setApod] = useState([]);
  const [dateRange, setDateRange] = useState({ fromDate: todaysDate, toDate: todaysDate });
  
  const getApod = async () =>
  {
    try
    {
      const res = await fetch(
        `https://api.nasa.gov/planetary/apod?api_key=${process.env.REACT_APP_APOD_API_KEY}&thumbs=true&start_date=${dateRange["fromDate"]}&end_date=${dateRange["toDate"]}`
        );
      const apod = await res.json(); 

      setApod(apod.reverse()); 
    }
    catch(e)
    {
      console.log(e); 
    }
    
  };
  
  useEffect(() =>
  {
    getApod();
  }, [dateRange]);

  return (
    
    <div className="App">
      <DatePicker setDateRange={setDateRange}/>
      <div class="container">
        {apod.map( apod =>
          {
            const {date, explanation: desc, title, url, hdurl, thumbnail_url} = apod; 
            return <ApodCard key={date} id={date} title={title} desc={desc} src={hdurl ? hdurl : (thumbnail_url ? thumbnail_url : url)} />;
          })
        }
      </div>
    
    </div>
  );
}

export default App;