import React, { useState, useEffect } from 'react';
import './App.css';
import ApodCard from "./ApodCard"; 


function App() {
  
  //use later for formatting dates that user chooses
  let todaysDate = new Date().toLocaleDateString("en-US").split("/").map(el => el.length === 1 ? el.padStart(2,0) : el);

  [todaysDate[1], todaysDate[2], todaysDate[0]] = [todaysDate[0], todaysDate[1], todaysDate[2]];
  
  todaysDate = todaysDate.join('-'); //now in proper YYYY-MM-DD format for api
  
  const [apod, setApod] = useState({});
  
  const getApod = async () =>
  {
    try
    {
      const res = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.REACT_APP_APOD_API_KEY}&thumbs=true`);
      const apod = await res.json(); 

      setApod(apod); 
    }
    catch(e)
    {
      console.log(e); 
    }
    
  }
  
  useEffect(() =>
  {
    getApod();
  }, []);
  
  const {date, explanation: desc, title, url, hdurl, thumbnail_url} = {...apod}; 

  return (
    
    <div className="App">
      
      <ApodCard id={date} title={title} desc={desc} src={hdurl ? hdurl : (thumbnail_url ? thumbnail_url : url)} />
    
    </div>
  );
}

export default App;
