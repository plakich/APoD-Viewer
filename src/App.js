import { useState, useEffect } from 'react';
import './App.css';
import ApodCard from "./ApodCard"; 
import {getFormattedDate} from "./dateFormatters";
import Hero from "./Hero";


function App() {
  
  const todaysDate = getFormattedDate().replace(/\//g, "-");
  
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
      <Hero apod={ apod[0] ? ( apod[0].hdurl ? apod[0].hdurl : ( apod[0].thumbnail_url ? apod[0].thumbnail_url : apod[0].url ) ) : apod[0]  } setDateRange={setDateRange}/>
      <div className="container">
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