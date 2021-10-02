import { ReactComponent as Logo } from './APoDLogo.svg';
import {useState, useEffect} from "react"; 
import DatePicker from "./DatePicker";

const Hero = ({setDateRange, apod}) =>
{
    
    const [isApodSet, setIsApodSet] = useState(apod);
    
    useEffect(() =>
    {
        if ( !isApodSet && typeof apod !== "undefined" ) 
        {
            const hero = document.querySelector(".hero");
            let heroBackgroundArr = getComputedStyle(hero).backgroundImage.split(',');
            
            heroBackgroundArr[heroBackgroundArr.length - 1] = `url("${apod}")`;
            
            hero.style.backgroundImage = heroBackgroundArr.join(","); 
            
            setIsApodSet(true);
        }
        
    }, [apod]);
              
    return  (
    
        <section className="hero">
            <header>
                <Logo className="logo"/>
                <h3 className="logo-text">APoD Viewer</h3>
            </header>
            <div className="hero__title">
                <h1 className="hero__title__text">
                    Astronomy Picture of the Day Viewer
                </h1>
            </div>
            <DatePicker setDateRange={setDateRange}/>
           
           
            
        </section>
    );
};

export default Hero;