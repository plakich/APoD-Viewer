import {memo, useCallback, useEffect} from "react"; 
import useMediaQuery from "../../hooks/useMediaQuery"; 
import ApodCard from "../ApodCard"; 

const ApodList = ({apodList}) => 
{
    const isDesktop = useMediaQuery("(min-width: 48.75rem)"); // 780px - when two cards fit side by side

    // On mobile, the apod's description is
    // collapsed and the user has to click to 
    // expand it. 
    const handleBtnClick = useCallback((e) =>
    {
        const expandDescBtn = e.currentTarget; 

        expandDescBtn.setAttribute("aria-expanded", 
            expandDescBtn.getAttribute("aria-expanded") === "true" ? false : true
        );

        // This just rotates the btn/arrow symbol up. 
        expandDescBtn.classList.toggle("show-desc"); 
        
        let card = expandDescBtn.parentElement; 
        
        // Need to work our way back up to the card itself,
        // because what we click on to expand the description,
        // the collapse arrow, is a child of the card and 
        // sibling with the card description itself. 
        // Could've done sibling selection but this works
        // even if the structure of Card later changes (i.e.,
        // it works as long as card desc is somewhere inside card).
        while( card && !card.classList.contains("card") )
        {
            card = card.parentElement; 
        }
        
        card.querySelector(".card__desc")
            .classList
            .toggle("show-desc"); 
    }, []);

    useEffect(() =>
    {
        if (isDesktop)
        {
            const cardDescList= document.querySelectorAll(".card__desc"); 

            Array.from(cardDescList).forEach((cardDesc) =>
            {
                // Descriptions are still shown on desktop.
                // This simply removes the class that expands
                // the description on mobile, which displays 
                // them a bit differently than we do on desktop.
                cardDesc.classList.remove("show-desc"); 
            });
        }

    }, [isDesktop]);
  
    return (
        
        apodList.map( apod =>
        {
            const {date, explanation: desc, title, url, hdurl, media_type} = apod; 
            return <ApodCard key={date} 
                        id={date} 
                        title={title} 
                        media_type={media_type}
                        desc={desc} 
                        hiResSrc={hdurl} 
                        lowResSrc={url} 
                        videoSrc={media_type === "video" ? url : null} // null else imgs will show vid link too
                        handleBtnClick={handleBtnClick}
                        // pass boolean down as props else we create this, 
                        // and any logic we write for it, apodList.length times
                        // if we useMediaQuery inside Card component
                        isDesktop={isDesktop} 
                    />;
        })
    );
};

export default memo(ApodList);