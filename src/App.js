
import './App.css';

function App() {
  
  //use later for formatting dates that user chooses
  let todaysDate = new todaysDate().toLocaletodaysDateString("en-US").split("/").map(el => el.length === 1 ? el.padStart(2,0) : el);

  [todaysDate[1], todaysDate[2], todaysDate[0]] = [todaysDate[0], todaysDate[1], todaysDate[2]];
  
  todaysDate = todaysDate.join('-'); //now in proper YYYY-MM-DD format for api
  
  let date, desc, title, url, hdurl, thumbnail_url; 
  
  fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&thumbs=true')
    .then(res => res.json())
    .then(apod => ({date, explanation: desc, title, hdurl, url, thumbnail_url} = apod))
    .catch(e => console.log(e));
  

  return (
    <div className="App">
      <Header />
      <Intro /> 
      <Card id={todaysDate} title={title} desc={desc} src={hdurl ? hdurl : (thumbnail_url ? thumbnail_url : url)} />
      <Footer />
    </div>
  );
}

export default App;
