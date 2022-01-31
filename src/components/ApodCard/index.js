const ApodCard = ({id, title, desc, hiResSrc, lowResSrc, videoSrc, media_type, handleBtnClick, isDesktop}) => 
{
    // For some of the earliest apods, 
    // the hd-URL provided by the api
    // was the same as the regular url (lowRes).
    // This avoids displaying a link to the same
    // image in the main card. 
    if (hiResSrc === lowResSrc) 
    {
        hiResSrc = null; 
    }
    
    return (
        
        <div className="card">
            {
            
                /*
                We use date (but hide visually) inside h2 for people using heading overview 
                on screen readers. We then hide for screen readers (aria-hidden) outside heading but display 
                visually. 
                */
                
            }
            <h2 className="card__title"><time dateTime={id} className="hide-visually">{id}</time> {title}</h2>
            <time aria-hidden="true" dateTime={id} className="card__date">{id}</time>
            {media_type === "image" && <a href={lowResSrc}><img className="card__img" src={lowResSrc} alt={"Click to view APOD for " + id}/></a>}
            {media_type === "video" && 
            <iframe
                title={`${id}: ${title}`}                      
                src={videoSrc}
                // Use card__img for vids on desktop because we need vids
                // to line up perfectly on desktop view with img cards,
                // whereas we give more room for mobile/solo cards.
                className={isDesktop ? "card__img" : "card__video"} 
                allow="encrypted-media"
                allowFullScreen={true}
            ></iframe>}
            { !isDesktop && 
                <div className="card__btn__cntr"> 
                    <button className="card__btn" aria-expanded="false" aria-label="show more" onClick={handleBtnClick}> 
                        <svg height="34" viewBox="0 0 48 48" width="34" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                            <path d="M33.17 17.17l-9.17 9.17-9.17-9.17-2.83 2.83 12 12 12-12z"/><path d="M0 0h48v48h-48z" fill="none"/>
                        </svg>
                    </button> 
                </div>
            }
            <p className="card__desc">{desc}
            {hiResSrc && <a href={hiResSrc} className="card__img__hi-res-link">View hi-res image</a>}
            {videoSrc && <a href={videoSrc} className="card__img__hi-res-link">View video</a>}  
            </p>
            
        </div>
        
    );
};

export default ApodCard; 