import { ReactComponent as Logo } from './APoDLogo.svg';
import {useState, useEffect} from "react"; 
import DatePicker from "./DatePicker";

const Hero = ({setDateRange, apod}) =>
{
    
    const [isApodSet, setIsApodSet] = useState(apod);
    const [isScrolled, setIsScrolled] = useState(false); 
    
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
    
    useEffect(() =>
    {
        const handleScroll = (e) =>
        {
            const datePicker = document.querySelector(".hero__title + .form-container"); 
            
            const datePickerBtm = datePicker.getBoundingClientRect().bottom; 
            
            if ( datePickerBtm <= 0 )
            {
                setIsScrolled(true);    
                datePicker.querySelector("button").disabled = true;
                
            }
            else
            {
                setIsScrolled(false);
                datePicker.querySelector("button").disabled = false;
            }
            
        };
        
        window.addEventListener("scroll", handleScroll); 
        window.addEventListener("resize", handleScroll); 
        
    }, []);
        
    return  (
    
        <section className="hero">
            {
                isScrolled ? 
                    <header className="header-fixed">
                        <Logo className="logo"/>
                        <h3 className="logo-text">APoD Viewer</h3>
                        <DatePicker setDateRange={setDateRange}/>
                    </header>
                            : 
                    <header>
                        <Logo className="logo"/>
                        <h3 className="logo-text">APoD Viewer</h3>
                    </header>
            }
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