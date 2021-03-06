import { ReactComponent as Logo } from '../../APoDLogo.svg';
import {useState, useEffect, useRef, memo} from "react"; 
import DatePicker from "../DatePicker";
import useMediaQuery from "../../hooks/useMediaQuery"; 
import useToggle from "../../hooks/useToggle";

const Hero = ({dateRange, setDateRange, heroImgUrl, isLoading}) =>
{
    const [isScrolled, setIsScrolled] = useState(false); // so we know when to display a fixed header/menu when scrolled past hero
    const hero = useRef(null); 
    
    const isDesktop = useMediaQuery("(min-width: 48.75rem)"); // 780px - so we can know when to show hamburger
    const [isToggled, toggleValue] = useToggle(false); // to show mobile menu on hamburger click
    
    // set hero background to be today's apod image
    useEffect(() =>
    {
        if (heroImgUrl)
        {
            let heroBackgroundImg = getComputedStyle(hero.current).backgroundImage;
            
            hero.current.style.backgroundImage = `${heroBackgroundImg}, url("${heroImgUrl}")`;
        }
        
    }, [heroImgUrl]);
    
    useEffect(() =>
    {
        // Fn lets us know when user has scrolled below 
        // hero section/hero datePicker (which is at bottom of hero always). 
        const handleScroll = (e) =>
        {
            const datePicker = hero.current.querySelector(".hero__title + .form-container"); 
            
            const datePickerBtm = datePicker.getBoundingClientRect().bottom; 
            
            if ( datePickerBtm <= 0 )
            {
                setIsScrolled(true);    
                
            }
            else
            {
                setIsScrolled(false);
            }
            
        };
        
        window.addEventListener("scroll", handleScroll); 
        window.addEventListener("resize", handleScroll); 
        
        return () => 
        {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleScroll); 
        };
        
    }, []);
        
    return  (
        <section className="hero" ref={hero}>
            {
                isScrolled ? 
                    <header className="header-fixed">
                        <Logo className="logo"/>
                        <p className="logo-text">APoD Viewer</p>
                        {
                            isDesktop ?
                                <DatePicker isLoading={isLoading} dateRange={dateRange} setDateRange={setDateRange}/>  
                                      :
                                        (
                                         isToggled ?
                                            <div className="mobile-menu">
                                                <div data-testid="hamburger-toggle" className="hamburger-toggle toggled" onClick={toggleValue}>
                                                    <div className="hamburger toggled"></div>
                                                </div>
                                                <DatePicker isLoading={isLoading} dateRange={dateRange} setDateRange={setDateRange}/>
                                            </div>
                                                   :
                                            <div data-testid="hamburger-toggle" className="hamburger-toggle" onClick={toggleValue}>
                                                <div className="hamburger"></div>
                                            </div>
                                        )
                        }
                    </header>
                            : 
                    <header>
                        <Logo className="logo"/>
                        <p className="logo-text">APoD Viewer</p>
                    </header>
            }
            <div className="hero__title">
                <h1 className="hero__title__text">
                    Astronomy Picture of the Day Viewer
                </h1>
            </div>
            <DatePicker isLoading={isLoading} dateRange={dateRange} setDateRange={setDateRange} /> 
               
        </section>
    );
};

// If we look at the props Hero takes, 
// and if we look at when App rerenders (Hero's parent),
// we'll notice that almost all the state
// of App updates together. Only on isolated
// isScrolled state changes will another Hero render be prevented. 
export default memo(Hero);